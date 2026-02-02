import Budget from '../models/budget.model.js';

export const createBudget = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { tag, amount, alertThreshold } = req.body;

        const existingBudget = await Budget.findOne({ userId, tag });
        if (existingBudget) {
            const error = new Error('Budget for this tag already exists');
            error.statusCode = 400;
            throw error;
        }

        const newBudget = await Budget.create({
            userId,
            tag,
            amount,
            alertThreshold: alertThreshold || 80,
        });

        res.status(201).json({
            success: true,
            data: newBudget,
        });
    } catch (error) {
        next(error);
    }
};

export const getBudgets = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const budgets = await Budget.find({ userId });

        res.status(200).json({
            success: true,
            data: budgets,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBudget = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { amount, alertThreshold } = req.body;

        const budget = await Budget.findOne({ _id: id, userId });
        if (!budget) {
            const error = new Error('Budget not found');
            error.statusCode = 404;
            throw error;
        }

        if (amount) budget.amount = amount;
        if (alertThreshold) budget.alertThreshold = alertThreshold;

        await budget.save();

        res.status(200).json({
            success: true,
            data: budget,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBudget = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const budget = await Budget.findOneAndDelete({ _id: id, userId });
        if (!budget) {
            const error = new Error('Budget not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: budget,
        });
    } catch (error) {
        next(error);
    }
};
