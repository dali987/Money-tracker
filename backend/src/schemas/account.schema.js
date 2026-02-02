import { z } from 'zod';

export const createAccountSchema = z.object({
    name: z.string().min(1, 'Name is required').max(30, 'Name must be at most 30 characters'),
    group: z.string().min(1, 'Group is required').max(20, 'Group must be at most 20 characters'),
    balance: z.number().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();
