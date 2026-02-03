import { z } from 'zod';

export const createRecurringTransactionSchema = z
    .object({
        type: z.enum(['income', 'expense', 'transfer'], {
            required_error: 'Type is required',
        }),
        amount: z.number().positive('Amount must be positive'),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
            required_error: 'Frequency is required',
        }),
        startDate: z.coerce.date(),
        fromAccount: z.string().optional(),
        toAccount: z.string().optional(),
        description: z.string().max(200, 'Description must be at most 200 characters').optional(),
        tags: z.array(z.string().max(20, 'Tag must be at most 20 characters')).optional(),
        active: z.boolean().default(true),
    })
    .refine((data) => data.fromAccount || data.toAccount, {
        message: "Recurring transaction must have either 'fromAccount' or 'toAccount'",
        path: ['fromAccount'],
    });

export const updateRecurringTransactionSchema = z
    .object({
        type: z.enum(['income', 'expense', 'transfer']).optional(),
        amount: z.number().positive('Amount must be positive').optional(),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
        startDate: z.coerce.date().optional(),
        fromAccount: z.string().optional(),
        toAccount: z.string().optional(),
        description: z.string().max(200, 'Description must be at most 200 characters').optional(),
        tags: z.array(z.string().max(20, 'Tag must be at most 20 characters')).optional(),
        active: z.boolean().optional(),
    })
    .refine((data) => data.fromAccount || data.toAccount, {
        message: "Recurring transaction must have either 'fromAccount' or 'toAccount'",
        path: ['fromAccount'],
    });
