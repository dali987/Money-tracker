import Account from '../models/account.model.js';

const toRounded2 = (value) => Math.round(value * 100) / 100;

const applyBalanceDelta = async (accountId, delta, session) => {
    const roundedDelta = toRounded2(delta);
    return Account.findByIdAndUpdate(
        accountId,
        [
            {
                $set: {
                    balance: {
                        $round: [{ $add: ['$balance', roundedDelta] }, 2],
                    },
                },
            },
        ],
        { session },
    );
};

export const accountActions = {
    income: async (transaction, session, factor = 1) =>
        applyBalanceDelta(transaction.toAccount, transaction.amount * factor, session),
    expense: async (transaction, session, factor = 1) =>
        applyBalanceDelta(transaction.fromAccount, -transaction.amount * factor, session),
    transfer: async (transaction, session, factor = 1) => {
        if (String(transaction.fromAccount) === String(transaction.toAccount)) {
            const error = new Error('Cannot update transfer to the same account');
            error.statusCode = 400;
            throw error;
        }

        await applyBalanceDelta(transaction.toAccount, transaction.amount * factor, session);
        await applyBalanceDelta(transaction.fromAccount, -transaction.amount * factor, session);
    },
};
