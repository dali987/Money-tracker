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

const getFilter = async (req) => {
    const { startDate, endDate, account, tags, excludeTags, type } = req.query;

    // Always fetch user's accounts to scope transactions
    const accounts = await Account.find({ user: req.user.id });
    const accountIds = accounts.map((account) => account._id);

    let transactionFilter = {};

    if (account) {
        const accountId = new mongoose.Types.ObjectId(account);
        transactionFilter.$or = [{ toAccount: accountId }, { fromAccount: accountId }];
    } else {
        transactionFilter.$or = [
            { toAccount: { $in: accountIds } },
            { fromAccount: { $in: accountIds } },
        ];
    }

    if (startDate && endDate) {
        transactionFilter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    if (tags) {
        transactionFilter.tags = { $in: tags.split(',') };
    }

    if (excludeTags) {
        const excluded = excludeTags.split(',');
        if (transactionFilter.tags) {
            transactionFilter.tags.$nin = excluded;
        } else {
            transactionFilter.tags = { $nin: excluded };
        }
    }

    if (type) {
        transactionFilter.type = { $in: type.split(',') };
    }

    return transactionFilter;
};

const CHART_GROUP_CONFIGS = {
    month: { $month: '$date' },
    day: { $dayOfMonth: '$date' },
    year: { $year: '$date' },
    tag: '$tags',
};

export const getTransactionChartData = async (req, res, next) => {
    try {
        const filter = await getFilter(req);
        const { groupBy = 'month' } = req.query;

        const groupExpression = CHART_GROUP_CONFIGS[groupBy] || CHART_GROUP_CONFIGS.month;

        const pipeline = [
            { $match: filter },
            {
                $group: {
                    _id: groupExpression,
                    income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
                    expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ];

        if (groupBy === 'tag') {
            pipeline.unshift({ $unwind: '$tags' });
        }

        const data = await Transaction.aggregate(pipeline);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('An error occurred while getting chart data: ', error);
        next(error);
    }
};

/* what this does:1- gets transactions from the start date given untill today, then reverse them (latest transactions -> first transactinos)
2- we loop through these transactions, for any transaction that is between the today and the end date given, it will subtract if its expense and add if its income from the current net worth (calculated through the accounts)
3- we get the net worth at the end of the period
4- then it removes the transactions that are after the end date (giving the transactions that are between the period given, and remember its still backwards so its from end to start time)
5- it makes an object that has the days or months as keys and the net worth at that time as values
6- it returns the object
*/

export const getNetWorthChartData = async (req, res, next) => {
    try {
        const { startDate, endDate, account, groupBy = 'month' } = req.query;
        const userId = req.user.id;

        const accountFilter = { user: userId };
        if (account) accountFilter._id = account;

        const accounts = await Account.find(accountFilter);
        const currentNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        const transactions = await Transaction.find({
            $or: [
                { toAccount: { $in: accounts.map((a) => a._id) } },
                { fromAccount: { $in: accounts.map((a) => a._id) } },
            ],
            type: { $in: ['income', 'expense'] },
            date: { $gte: new Date(startDate) },
        }).sort({ date: -1 });

        const endOfPeriod = new Date(endDate);

        let netWorthAtEndOfPeriod = currentNetWorth;
        transactions.forEach((t) => {
            if (new Date(t.date) > endOfPeriod) {
                if (t.type === 'income') netWorthAtEndOfPeriod -= t.amount;
                if (t.type === 'expense') netWorthAtEndOfPeriod += t.amount;
            }
        });

        const chartTransactions = transactions.filter((t) => new Date(t.date) <= endOfPeriod);

        const grouped = {};
        chartTransactions.forEach((t) => {
            const date = new Date(t.date);
            let key;
            if (groupBy === 'month') key = date.getMonth() + 1;
            else if (groupBy === 'day') key = date.getDate();

            if (!grouped[key]) grouped[key] = 0;
            if (t.type === 'income') grouped[key] += t.amount;
            if (t.type === 'expense') grouped[key] -= t.amount;
        });

        /*
        {
            1: 100,
            2: 200,
            3: 300,
            ...
        }
        */

        res.status(200).json({
            success: true,
            data: {
                netWorthAtEndOfPeriod,
                changes: grouped,
            },
        });
    } catch (error) {
        console.error('An error occurred while getting net worth chart: ', error);
        next(error);
    }
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
        const filter = await getFilter(req);
        const transactions = await Transaction.find(filter);

        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error('An error occurred while getting user transactions: ', error);
        next(error);
    }
};

export const calculateTransactionSum = async (req, res, next) => {
    try {
        const filter = await getFilter(req);

        const result = await Transaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    Income: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                    },
                    Expense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    Income: 1,
                    Expense: 1,
                    netWorth: { $subtract: ['$Income', '$Expense'] },
                },
            },
        ]);
        const summary = result[0] || { Income: 0, Expense: 0, netWorth: 0 };

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error('An error occurred while getting user transactions: ', error);
        next(error);
    }
};

export const getTransaction = async (req, res, next) => {
    try {
        const { transactionId } = req.body;

        const transaction = await Transaction.findById(transactionId);

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
