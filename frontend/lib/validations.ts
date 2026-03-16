import z from 'zod';

export const transactionSchema = z
    .strictObject({
        type: z.enum(['expense', 'income', 'transfer']),
        fromAccount: z.string().optional().nullable(),
        toAccount: z.string().optional().nullable(),
        amount: z
            .number()
            .positive('Amount must be greater than 0')
            .max(1000000000, 'Amount must be a realistic number'),
        date: z.string().nullable(),
        note: z.string().max(200, 'Note must be at most 200 characters').optional(),
        tags: z
            .array(z.string().max(20, 'Tag must be at most 20 characters').nullable())
            .optional()
            .nullable(),
    })
    .refine(
        (data) => {
            if (data.type === 'transfer') {
                return !!data.fromAccount && !!data.toAccount;
            }
            return !!data.fromAccount || !!data.toAccount;
        },
        {
            message: 'Transfer requires both destination and source accounts.',
            path: ['fromAccount'],
        },
    );

export const dateSchema = z.object({
    start: z.date(),
    end: z.date(),
});

export const accountSchema = z.object({
    name: z.string().min(1, 'Name is required').max(30, 'Name must be at most 30 characters'),
    group: z.string().min(1, 'Group is required').max(20, 'Group must be at most 20 characters'),
    balance: z.number(),
});
