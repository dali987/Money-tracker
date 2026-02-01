import Account from '../models/account.model.js';

export const accountActions = {
    income: async (transaction, session, factor = 1) =>
        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount * factor } },
            { session },
        ),
    expense: async (transaction, session, factor = 1) =>
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount * factor } },
            { session },
        ),
    transfer: async (transaction, session, factor = 1) => {
        if (transaction.fromAccount === transaction.toAccount) {
            const error = new Error('Cannot update transfer to the same account');
            error.status = 400;
            throw error;
        }

        await Account.findByIdAndUpdate(
            transaction.toAccount,
            { $inc: { balance: transaction.amount * factor } },
            { session },
        );
        await Account.findByIdAndUpdate(
            transaction.fromAccount,
            { $inc: { balance: -transaction.amount * factor } },
            { session },
        );
    },
};
