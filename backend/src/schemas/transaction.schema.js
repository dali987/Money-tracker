import { z } from 'zod';

const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;

const type = z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be income, expense, or transfer',
});
const amount = z
    .number()
    .positive('Amount must be positive')
    .max(1000000000, 'Amount must be at most 1,000,000,000')
    .transform(roundToTwoDecimals);
const fromAccount = z.string().optional();
const toAccount = z.string().optional();
const note = z.string().max(200, 'Note must be at most 200 characters').optional();
const tags = z.array(z.string().max(20, 'Tag must be at most 20 characters')).optional();
const date = z.coerce.date().optional();

export const createTransactionSchema = z
    .object({
        type: type,
        amount: amount,
        fromAccount: fromAccount,
        toAccount: toAccount,
        note: note,
        tags: tags,
        date: date, // Coerce string to date
    })
    .refine(
        (data) => {
            if (data.type === 'transfer') {
                return !!data.fromAccount && !!data.toAccount;
            }
            return !!data.fromAccount || !!data.toAccount;
        },
        {
            message: "Transfer must have both 'fromAccount' and 'toAccount'.",
            path: ['fromAccount'],
        },
    );

export const updateTransactionSchema = z
    .object({
        type: type.optional(),
        amount: amount.optional(),
        fromAccount: fromAccount,
        toAccount: toAccount,
        note: note,
        tags: tags,
        date: date, // Coerce string to date
    })
    .refine(
        (data) => {
            if (data.type === 'transfer') {
                return !!data.fromAccount && !!data.toAccount;
            }
            return !!data.fromAccount || !!data.toAccount;
        },
        {
            message: "Transfer must have both 'fromAccount' and 'toAccount'.",
            path: ['fromAccount'],
        },
    );
