import { z } from 'zod';

export const createTransactionSchema = z
    .object({
        type: z.enum(['income', 'expense', 'transfer'], {
            required_error: 'Type is required',
            invalid_type_error: 'Type must be income, expense, or transfer',
        }),
        amount: z.number().positive('Amount must be positive'),
        fromAccount: z.string().optional(), // validated as ObjectId by database or custom zod validator? String is fine for now
        toAccount: z.string().optional(),
        note: z.string().max(200, 'Note must be at most 200 characters').optional(),
        tags: z.array(z.string().max(20, 'Tag must be at most 20 characters')).optional(),
        date: z.coerce.date().optional(), // Coerce string to date
    })
    .refine((data) => data.fromAccount || data.toAccount, {
        message: "Transaction must have either 'fromAccount' or 'toAccount'",
        path: ['fromAccount'],
    });

export const updateTransactionSchema = createTransactionSchema.partial();
