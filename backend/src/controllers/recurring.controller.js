import mongoose from 'mongoose';
import RecurringTransaction from '../models/recurringTransaction.model.js';
import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';

// Helper to calculate next run date
const calculateNextRunDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    if (frequency === 'daily') date.setDate(date.getDate() + 1);
    if (frequency === 'weekly') date.setDate(date.getDate() + 7);
    if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
    if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
};

// Reusing actions from transaction controller logic for consistency if needed,
// but we will primarily use the existing `Transaction.create` flow or manually update.
// Actually, creating a Transaction document via API calls `createTransaction` which handles balance updates.
// Here we are internal. We should replicate the balance update logic to ensure consistency.

const accountActions = {
    income: async (transaction, session) =>
        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount } },
            { session },
        ),
    expense: async (transaction, session) =>
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount } },
            { session },
        ),
    transfer: async (transaction, session) => {
        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount } },
            { session },
        );
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount } },
            { session },
        );
    },
};

export const createRecurringTransaction = async (req, res, next) => {
    try {
        const { startDate } = req.body;
        // Default nextRunDate to startDate if not provided
        const nextRunDate = startDate ? new Date(startDate) : new Date();

        const recurring = await RecurringTransaction.create({
            ...req.body,
            user: req.user.id,
            nextRunDate,
        });

        res.status(201).json({ success: true, data: recurring });
    } catch (error) {
        console.error('Error creating recurring transaction:', error);
        next(error);
    }
};

export const getRecurringTransactions = async (req, res, next) => {
    try {
        const recurring = await RecurringTransaction.find({ user: req.user.id })
            .populate('fromAccount', 'name')
            .populate('toAccount', 'name');
        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        console.error('Error fetching recurring transactions:', error);
        next(error);
    }
};

export const updateRecurringTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recurring = await RecurringTransaction.findOneAndUpdate(
            { _id: id, user: req.user.id },
            req.body,
            { new: true },
        );

        if (!recurring) {
            return res
                .status(404)
                .json({ success: false, message: 'Recurring transaction not found' });
        }

        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        console.error('Error updating recurring transaction:', error);
        next(error);
    }
};

export const deleteRecurringTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: id,
            user: req.user.id,
        });

        if (!recurring) {
            return res
                .status(404)
                .json({ success: false, message: 'Recurring transaction not found' });
        }

        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        console.error('Error deleting recurring transaction:', error);
        next(error);
    }
};

// Core processing logic (independent of Express req/res)
export const processDueRecurringTransactions = async (userId = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let processedCount = 0;

    try {
        const today = new Date();
        const query = {
            active: true,
            nextRunDate: { $lte: today },
        };
        if (userId) {
            query.user = userId;
        }

        // Find due recurring transactions
        const dueTransactions = await RecurringTransaction.find(query).session(session);

        for (const recurring of dueTransactions) {
            // 1. Create the real Transaction
            const newTransaction = new Transaction({
                // user: recurring.user, // Transaction model doesn't store user directly usually, mainly via accounts
                type: recurring.type,
                fromAccount: recurring.fromAccount, // These link to accounts which are linked to user
                toAccount: recurring.toAccount,
                amount: recurring.amount,
                note: recurring.description, // Mapping description -> note
                date: recurring.nextRunDate,
                tags: recurring.tags,
            });

            await newTransaction.save({ session });
            processedCount++;

            // 2. Update Account Balances
            await accountActions[recurring.type](recurring, session);

            // 3. Update Recurring Rule (nextRunDate)
            let nextDate = new Date(recurring.nextRunDate);
            while (nextDate <= today) {
                nextDate = calculateNextRunDate(nextDate, recurring.frequency);
            }

            recurring.nextRunDate = nextDate;
            recurring.lastRunDate = new Date();
            await recurring.save({ session });
        }

        await session.commitTransaction();
        return processedCount;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
