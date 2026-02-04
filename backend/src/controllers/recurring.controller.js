import mongoose from 'mongoose';
import RecurringTransaction from '../models/recurringTransaction.model.js';
import Transaction from '../models/transaction.model.js';
import { accountActions } from '../utils/accountActions.js';
import Account from '../models/account.model.js';

const calculateNextRunDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    if (frequency === 'daily') date.setDate(date.getDate() + 1);
    if (frequency === 'weekly') date.setDate(date.getDate() + 7);
    if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
    if (frequency === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
};

const verifyAccountOwnership = async (fromAccount, toAccount, userId) =>{
    if (fromAccount) {
            const acc = await Account.findOne({ _id: fromAccount, user: userId });
            if (!acc) {
                const error = new Error('Unauthorized: You do not own the source account');
                error.statusCode = 403;
                throw error;
            }
        }
        if (toAccount) {
            const acc = await Account.findOne({ _id: toAccount, user: userId });
            if (!acc) {
                const error = new Error('Unauthorized: You do not own the destination account');
                error.statusCode = 403;
                throw error;
            }
        }
}

export const createRecurringTransaction = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { startDate, fromAccount, toAccount } = req.body;
        const userId = req.user._id;

        await verifyAccountOwnership(fromAccount, toAccount, userId)

        const nextRunDate = startDate ? new Date(startDate) : new Date();

        const recurring = await RecurringTransaction.create([{
            ...req.body,
            user: userId,
            nextRunDate,
        }], { session });

        await session.commitTransaction()

        res.status(201).json({ success: true, data: recurring[0] });
    } catch (error) {
        await session.abortTransaction()
        console.error('Error creating recurring transaction:', error);
        next(error);
    } finally {
        session.endSession()
    }
};

export const getRecurringTransactions = async (req, res, next) => {
    try {
        const recurring = await RecurringTransaction.find({ user: req.user._id })
            .populate('fromAccount', 'name')
            .populate('toAccount', 'name');
        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        console.error('Error fetching recurring transactions:', error);
        next(error);
    }
};

export const updateRecurringTransaction = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { fromAccount, toAccount } = req.body;

        await verifyAccountOwnership(fromAccount, toAccount, userId)

        const recurring = await RecurringTransaction.findOneAndUpdate(
            { _id: id, user: userId },
            req.body,
            { new: true, session },
        );

        if (!recurring) {
            const error = new Error('Recurring transaction not found');
            error.statusCode = 404;
            throw error;
        }

        await session.commitTransaction()
        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        await session.abortTransaction()
        console.error('Error updating recurring transaction:', error);
        next(error);
    } finally {
        session.endSession()
    }
};

export const deleteRecurringTransaction = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { id } = req.params;
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: id,
            user: req.user._id,
        }, { session });

        if (!recurring) {
            const error = new Error('Recurring transaction not found');
            error.statusCode = 404;
            throw error;
        }

        await session.commitTransaction()
        res.status(200).json({ success: true, data: recurring });
    } catch (error) {
        await session.abortTransaction()
        console.error('Error deleting recurring transaction:', error);
        next(error);
    } finally {
        session.endSession()
    }
};

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

        const dueTransactions = await RecurringTransaction.find(query).session(session);

        for (const recurring of dueTransactions) {
            let nextDate = new Date(recurring.nextRunDate);

            while (nextDate <= today) {
                const newTransaction = new Transaction({
                    type: recurring.type,
                    fromAccount: recurring.fromAccount,
                    toAccount: recurring.toAccount,
                    amount: recurring.amount,
                    note: recurring.description,
                    date: nextDate,
                    tags: recurring.tags,
                });

                await newTransaction.save({ session });

                await accountActions[recurring.type](recurring, session);

                nextDate = calculateNextRunDate(nextDate, recurring.frequency);
            }

            recurring.nextRunDate = nextDate;
            recurring.lastRunDate = new Date();
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
