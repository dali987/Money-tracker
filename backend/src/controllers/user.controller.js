import mongoose from 'mongoose';
import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import { getRates } from './exchange.controller.js';

export const getUser = async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, data: req.user });
    } catch (error) {
        console.error('An error occurred while getting user: ', error);
        next(error);
    }
};

const ALLOWED_SETTINGS = [
    'currencies',
    'baseCurrency',
    'tags',
    'groups',
    'username',
    'name',
    'image',
    'profilePic',
];
export const getSetting = async (req, res, next) => {
    try {
        const { key } = req.params;

        if (!req.user) {
            const error = new Error("Unauthorized");
            error.statusCode = 401;
            throw error;
        }

        if (!ALLOWED_SETTINGS.includes(key)) {
            const error = new Error("Invalid setting key");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        console.error('An error occurred while getting setting: ', error);
        next(error);
    }
};
export const updateSetting = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.user) {
            const error = new Error("Unauthorized");
            error.statusCode = 401;
            throw error;
        };
        const { key, setting } = req.body;

        if (!key || setting == undefined) {
            const error = new Error("Key and setting required");
            error.statusCode = 400;
            throw error;
        }
        if (!ALLOWED_SETTINGS.includes(key)) {
            const error = new Error("Invalid key");
            error.statusCode = 400;
            throw error;
        }

        const oldCurrency = req.user.baseCurrency;
        req.user[key] = setting;

        if (key === 'baseCurrency' && oldCurrency !== setting) {
            const ratesData = await getRates();
            const rates = ratesData.rates;

            const fromRate = rates.get(oldCurrency);
            const toRate = rates.get(setting);

            if (fromRate && toRate) {
                const multiplier = toRate / fromRate;

                await Account.updateMany(
                    { user: req.user._id },
                    [
                        {
                            $set: {
                                balance: { $round: [{ $multiply: ['$balance', multiplier] }, 2] },
                            },
                        },
                    ],
                    { session },
                );

                const userAccountIds = await Account.find({ user: req.user._id })
                    .session(session)
                    .distinct('_id');
                if (userAccountIds.length > 0) {
                    await Transaction.updateMany(
                        {
                            $or: [
                                { fromAccount: { $in: userAccountIds } },
                                { toAccount: { $in: userAccountIds } },
                            ],
                        },
                        [
                            {
                                $set: {
                                    amount: {
                                        $round: [{ $multiply: ['$amount', multiplier] }, 2],
                                    },
                                },
                            },
                        ],
                        { session },
                    );
                }
            }
        }

        await req.user.save({ session });
        await session.commitTransaction();

        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while updating setting: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const addSetting = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { key, setting } = req.body;

        if (!key || setting == undefined) {
            const error = new Error("Key and setting required");
            error.statusCode = 400;
            throw error;
        }

        if (!ALLOWED_SETTINGS.includes(key)) {
            const error = new Error("Invalid key");
            error.statusCode = 400;
            throw error;
        }

        if (!Array.isArray(req.user[key])) {
            const error = new Error("Not an array");
            error.statusCode = 400;
            throw error;
        }

        const itemsToAdd = Array.isArray(setting) ? setting : [setting];

        itemsToAdd.forEach((item) => {
            if (!req.user[key].includes(item)) {
                req.user[key].push(item);
            }
        });
        await req.user.save({ session });
        await session.commitTransaction();

        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while adding setting: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};

export const removeSetting = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { key, setting } = req.body;

        if (!key || setting == undefined) {
            const error = new Error("Key and setting required");
            error.statusCode = 400;
            throw error;
        }
        if (!ALLOWED_SETTINGS.includes(key)) {
            const error = new Error("Invalid key");
            error.statusCode = 400;
            throw error;
        }
        if (!Array.isArray(req.user[key])) {
            const error = new Error("Not an array");
            error.statusCode = 400;
            throw error;
        }

        const itemsToRemove = Array.isArray(setting) ? setting : [setting];

        itemsToRemove.forEach((item) => req.user[key].pull(item));

        await req.user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        await session.abortTransaction();
        console.error('An error occurred while removing setting: ', error);
        next(error);
    } finally {
        session.endSession();
    }
};
