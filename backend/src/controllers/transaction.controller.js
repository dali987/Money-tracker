import mongoose from 'mongoose';
import Transaction from '../models/transaction.model.js';
import Account from '../models/account.model.js';
import { accountActions } from '../utils/accountActions.js';

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

const verifyTransactionOwnership = async (transactionId, userId) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return null;

    // Check if either account belongs to the user
    const accountFilter = { user: userId, _id: { $in: [] } };
    if (transaction.fromAccount) accountFilter._id.$in.push(transaction.fromAccount);
    if (transaction.toAccount) accountFilter._id.$in.push(transaction.toAccount);

    if (accountFilter._id.$in.length === 0) return null; // Should not happen for valid transactions

    const userAccount = await Account.findOne(accountFilter);
    return userAccount ? transaction : null;
};

export const createTransaction = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fromAccount, toAccount, type } = req.body;
        const userId = req.user.id;

        // SECURITY: Verify user owns the accounts
        if (fromAccount) {
            const acc = await Account.findOne({ _id: fromAccount, user: userId });
            if (!acc) throw new Error('Unauthorized: You do not own the source account');
        }
        if (toAccount) {
            const acc = await Account.findOne({ _id: toAccount, user: userId });
            if (!acc) throw new Error('Unauthorized: You do not own the destination account');
        }

        const transaction = await Transaction.create(
            [
                {
                    ...req.body,
                },
            ],
            { session },
        );

        await accountActions[type](transaction[0], session);

        await session.commitTransaction();

        res.status(201).json({ success: true, data: transaction[0] });
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
        console.log("running")
        const filter = await getFilter(req);
        const { page, limit } = req.query;

        // If pagination params provided, return paginated response
        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
            const skip = (pageNum - 1) * limitNum;

            const [transactions, totalCount] = await Promise.all([
                Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
                Transaction.countDocuments(filter),
            ]);

            const totalPages = Math.ceil(totalCount / limitNum);

            return res.status(200).json({
                success: true,
                data: transactions,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1,
                },
            });
        }

        // Legacy: return all transactions without pagination
        const transactions = await Transaction.find(filter).sort({ date: -1 });
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
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalIncome: 1,
                    totalExpense: 1,
                    netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
                },
            },
        ]);
        const summary = result[0] || { totalIncome: 0, totalExpense: 0, netBalance: 0 };

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error('An error occurred while getting user transactions: ', error);
        next(error);
    }
};

export const getTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const transaction = await verifyTransactionOwnership(id, userId);

        if (!transaction) {
            const error = new Error('Transaction not found or unauthorized');
            error.status = 404;
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
        const userId = req.user.id;

        // SECURITY check
        const transaction = await verifyTransactionOwnership(transactionId, userId);
        if (!transaction) {
            const error = new Error('Transaction not found or unauthorized');
            error.status = 404;
            throw error;
        }

        // Revert balance changes from old transaction
        await accountActions[transaction.type](transaction, session, -1);

        // Update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { ...req.body },
            { new: true, session },
        );

        // Apply new balance changes
        await accountActions[updatedTransaction.type](updatedTransaction, session);

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
        const userId = req.user.id;

        // SECURITY check
        const transaction = await verifyTransactionOwnership(transactionId, userId);
        if (!transaction) {
            const error = new Error('Transaction not found or unauthorized');
            error.status = 404;
            throw error;
        }

        const deletedTransaction =
            await Transaction.findByIdAndDelete(transactionId).session(session);

        await accountActions[deletedTransaction.type](deletedTransaction, session, -1);

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
