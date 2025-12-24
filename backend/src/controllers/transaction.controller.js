import mongoose from 'mongoose';
import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';

const actions = {
    income: async (transaction, factor, session) =>
        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount * factor } },
            { session }
        ),
    expense: async (transaction, factor, session) =>
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount * factor } },
            { session }
        ),
    transfer: async (transaction, factor, session) => {
        if (transaction.fromAccount === transaction.ftoAccount) {
            const error = new Error('Cannot update transfer to the same account');
            error.status = 400;
            throw error;
        }

        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount * factor } },
            { session }
        );
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount * factor } },
            { session }
        );
    },
};

export const createTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = await Transaction.create({
            ...req.body,
        });

        const { type } = req.body;

        await actions[type](transaction, 1, session);

        await session.commitTransaction();

        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        console.error('An error occurred while creating a transaction: ', error);
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const getTransactionWithFilter = async (req, res, next) => {
    try {
        const { startDate, endDate, account, tags, type, user } = req.query;

        let transactionFilter = {}

        if (user == "true"){

            const accounts = await Account.find({ user: req.user.id });

            transactionFilter.$or = [
                { toAccount: { $in: accounts.map(account => account._id) } },
                { fromAccount: { $in: accounts.map(account => account._id) } },
            ]
        }

        if (account){
            transactionFilter.$or = [
                { toAccount: account },
                { fromAccount: account },
            ]
        }

        if (startDate && endDate) {
            transactionFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        }

        if (tags) {
            transactionFilter.tags = { $in: tags }
        }

        if (type) {
            transactionFilter.type = type
        }

        console.log("filter: ", transactionFilter)

        const transactions = await Transaction.find(transactionFilter)

        console.log("transactions: ", transactions)

        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error('An error occurred while getting user transactions: ', error);
        next(error);
    }
};

export const getTransaction = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const { transactionId } = req.body;

        const transaction = await Transaction.findById(transactionId);

        if (transaction.user._id.toString() !== req.user.id.toString()) {
            const error = new Error('You are not the owner of this transaction');
            error.status = 401;
            throw error;
        }

        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        console.error('An error occurred while getting the transaction: ', error);
        next(error);
    }
};

export const updateTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId);

        await actions[transaction.type](transaction, -1, session);

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            {
                ...req.body,
            },
            { new: true }
        );

        if (!updatedTransaction) {
            const error = new Error('updating transaction failed');
            error.status = 401;
            throw error;
        }

        await actions[transaction.type](updatedTransaction, 1, session);

        await session.commitTransaction();
        res.status(200).json({ success: true, data: updatedTransaction });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while updating the transaction: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const deleteTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: transactionId } = req.params;

        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

        if (!deletedTransaction) {
            const error = new Error('failed to delete transaction');
            error.status = 401;
            throw error;
        }

        await actions[deletedTransaction.type](deletedTransaction, -1, session);

        await session.commitTransaction();

        res.status(200).json({ success: true, data: deletedTransaction });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while deleting the transaction: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};
