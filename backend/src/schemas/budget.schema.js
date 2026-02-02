import { z } from 'zod';

export const createBudgetSchema = z.object({
    tag: z.string().min(1, 'Tag is required'),
    amount: z.number().positive('Amount must be positive'),
    alertThreshold: z.number().min(0).max(100).optional().default(80),
});

export const updateBudgetSchema = createBudgetSchema.partial();
