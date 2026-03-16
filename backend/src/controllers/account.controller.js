import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';

export const createAccount = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { user } = req;
        const { name, group } = req.body;

        const existingAccount = await Account.findOne({
            user: user._id,
            name,
            group,
        }).session(session);

        if (existingAccount) {
            const error = new Error('Account already exists');
            error.statusCode = 400;
            throw error;
        }

        const account = await Account.create(
            [
                {
                    ...req.body,
                    user: user._id,
                },
            ],
            { session },
        );

        await session.commitTransaction();
        res.status(201).json({ success: true, data: account[0] });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while creating an account: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const updateAccount = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: accountId } = req.params;

        const account = await Account.findOneAndUpdate(
            { _id: accountId, user: req.user._id },
            req.body,
            { new: true, session },
        );

        if (!account) {
            const error = new Error('Account not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        await session.commitTransaction();
        res.status(200).json({ success: true, data: account });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while updating an account: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const deleteAccount = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: accountId } = req.params;

        const account = await Account.findOneAndDelete({
            _id: accountId,
            user: req.user._id,
        }).session(session);

        if (!account) {
            const error = new Error('Account not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        await Transaction.deleteMany({
            $or: [{ fromAccount: accountId }, { toAccount: accountId }],
        }).session(session);

        await session.commitTransaction();
        res.status(200).json({ success: true, data: account });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while deleting an account: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const getUserAccounts = async (req, res, next) => {
    try {
        const accounts = await Account.find({ user: req.user._id });
        res.status(200).json({ success: true, data: accounts });
    } catch (error) {
        console.error('An error occurred while getting user accounts: ', error);
        next(error);
    }
};

export const getAccount = async (req, res, next) => {
    try {
        const { id: accountId } = req.params;
        const account = await Account.findById(accountId);

        if (!account || account.user._id.toString() !== req.user._id.toString()) {
            const error = new Error('Account not found or unauthorized');
            error.statusCode = 401;
            throw error;
        }

        res.status(200).json({ success: true, data: account });
    } catch (error) {
        console.error('An error occurred while getting the account: ', error);
        next(error);
    }
};

export const getAccountsSummary = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const summaryData = await Account.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $facet: {
                    total: [{ $group: { _id: null, totalNetWorth: { $sum: '$balance' } } }],
                    byGroup: [{ $group: { _id: '$group', balance: { $sum: '$balance' } } }],
                },
            },
            {
                $project: {
                    totalNetWorth: { $ifNull: [{ $arrayElemAt: ['$total.totalNetWorth', 0] }, 0] },
                    sumsByGroup: {
                        $arrayToObject: {
                            $map: {
                                input: '$byGroup',
                                as: 'item',
                                in: { k: '$$item._id', v: '$$item.balance' },
                            },
                        },
                    },
                },
            },
        ]);

        const data = summaryData[0] || { totalNetWorth: 0, sumsByGroup: {} };

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('An error occurred while getting account summary: ', error);
        next(error);
    }
};
