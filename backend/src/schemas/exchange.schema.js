import { z } from 'zod';

export const convertCurrencyQuerySchema = z.object({
    from: z.string().min(3).max(3),
    to: z.string().min(3).max(3),
    amount: z.coerce.number().nonnegative(),
});
