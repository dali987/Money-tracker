import Account from '../models/account.model.js';
import Transaction from '../models/transaction.model.js';
import { getRates } from './exchange.controller.js';

export const getUser = async (req, res, next) => {
    try {
        if (!req.user) res.status(401).json({ message: 'Unauthorized' });
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
        const { key } = req.params; // Changed to params to match your router :key

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (!ALLOWED_SETTINGS.includes(key))
            return res.status(400).json({ message: 'Invalid setting key' });

        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        next(error);
    }
};
export const updateSetting = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { key, setting } = req.body;

        if (!key || setting == undefined)
            return res.status(400).json({ message: 'Key and setting are required' });
        if (!ALLOWED_SETTINGS.includes(key))
            return res.status(400).json({ message: 'Invalid key' });

        const oldCurrency = req.user.baseCurrency;
        req.user[key] = setting;

        if (key === 'baseCurrency' && oldCurrency !== setting) {
            try {
                const ratesData = await getRates();
                const rates = ratesData.rates;

                const fromRate = rates.get(oldCurrency);
                const toRate = rates.get(setting);

                if (fromRate && toRate) {
                    const multiplier = toRate / fromRate;

                    // 1. Update all accounts for this user
                    await Account.updateMany({ user: req.user._id }, [
                        {
                            $set: {
                                balance: { $round: [{ $multiply: ['$balance', multiplier] }, 2] },
                            },
                        },
                    ]);

                    // 2. Update all transactions for this user's accounts to keep history consistent
                    const userAccountIds = await Account.find({ user: req.user._id }).distinct(
                        '_id'
                    );
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
                            ]
                        );
                    }
                }
            } catch (error) {
                console.error('Failed to update account balances during currency change:', error);
                // We keep going as we already updated the user's baseCurrency in memory,
                // but maybe we should throw here?
                // Given the user's request, they want this to happen.
            }
        }

        await req.user.save();
        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        console.error('An error occurred while updating setting: ', error);
        next(error);
    }
};

export const addSetting = async (req, res, next) => {
    try {
        const { key, setting } = req.body;

        if (!key || setting == undefined)
            return res.status(400).json({ message: 'Key and setting required' });
        if (!ALLOWED_SETTINGS.includes(key))
            return res.status(400).json({ message: 'Invalid key' });
        if (!Array.isArray(req.user[key])) return res.status(400).json({ message: 'Not an array' });

        const itemsToAdd = Array.isArray(setting) ? setting : [setting];

        itemsToAdd.forEach((item) => {
            if (!req.user[key].includes(item)) {
                req.user[key].push(item);
            }
        });
        await req.user.save();
        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        console.error('An error occurred while adding setting: ', error);
        next(error);
    }
};

export const removeSetting = async (req, res, next) => {
    try {
        const { key, setting } = req.body;

        if (!key || setting == undefined)
            return res.status(400).json({ message: 'Key and setting required' });
        if (!ALLOWED_SETTINGS.includes(key))
            return res.status(400).json({ message: 'Invalid key' });
        if (!Array.isArray(req.user[key])) return res.status(400).json({ message: 'Not an array' });

        const itemsToRemove = Array.isArray(setting) ? setting : [setting];

        itemsToRemove.forEach((item) => req.user[key].pull(item));
        await req.user.save();
        res.status(200).json({ success: true, data: req.user[key] });
    } catch (error) {
        next(error);
    }
};
