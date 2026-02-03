import { z } from 'zod';

const type = z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be income, expense, or transfer',
});
const amount = z.number().positive('Amount must be positive');
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
    .refine((data) => data.fromAccount || data.toAccount, {
        message: "Transaction must have either 'fromAccount' or 'toAccount'",
        path: ['fromAccount'],
    });

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
    .refine((data) => data.fromAccount || data.toAccount, {
        message: "Transaction must have either 'fromAccount' or 'toAccount'",
        path: ['fromAccount'],
    });
