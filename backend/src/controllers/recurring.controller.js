import mongoose from 'mongoose';
import RecurringTransaction from '../models/recurringTransaction.model.js';
import Transaction from '../models/transaction.model.js';
import { accountActions } from '../utils/accountActions.js';

const calculateNextRunDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    if (frequency === 'daily') date.setDate(date.getDate() + 1);
    if (frequency === 'weekly') date.setDate(date.getDate() + 7);
    if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
    if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
};

export const createRecurringTransaction = async (req, res, next) => {
    try {
        const { startDate } = req.body;
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
            let nextDate = new Date(recurring.nextRunDate);

            // Loop to catch up on missed transactions
            while (nextDate <= today) {
                // 1. Create the real Transaction
                const newTransaction = new Transaction({
                    // user: recurring.user,
                    type: recurring.type,
                    fromAccount: recurring.fromAccount,
                    toAccount: recurring.toAccount,
                    amount: recurring.amount,
                    note: recurring.description,
                    date: nextDate, // Use the specific run date
                    tags: recurring.tags,
                });

                await newTransaction.save({ session });

                // 2. Update Account Balances
                await accountActions[recurring.type](recurring, session);

                // 3. Calculate next run date
                nextDate = calculateNextRunDate(nextDate, recurring.frequency);
            }

            // 4. Update Recurring Rule
            recurring.nextRunDate = nextDate;
            recurring.lastRunDate = new Date(); // Or the last actual run date in the loop, but today is fine as "processed at"
            await recurring.save({ session });
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
