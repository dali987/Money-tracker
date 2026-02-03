import { z } from 'zod';

const optionalString = z.string().optional();
const optionalDate = z.coerce.date().optional();
const emptyToUndefined = z.preprocess((val) => (val === '' ? undefined : val), z.string().optional());
const coercedInt = z.coerce.number().int().positive().optional();

export const transactionListQuerySchema = z.object({
    startDate: optionalDate,
    endDate: optionalDate,
    account: emptyToUndefined,
    tags: emptyToUndefined,
    type: emptyToUndefined,
    excludeTags: emptyToUndefined,
    page: coercedInt.default(1),
    limit: coercedInt.default(10),
});

export const transactionChartQuerySchema = z.object({
    startDate: optionalDate,
    endDate: optionalDate,
    account: emptyToUndefined,
    tags: emptyToUndefined,
    excludeTags: emptyToUndefined,
    type: optionalString,
    groupBy: z.enum(['day', 'month', 'year', 'tag']).optional(),
});

export const transactionNetWorthQuerySchema = z.object({
    startDate: optionalDate,
    endDate: optionalDate,
    account: emptyToUndefined,
    excludeTags: emptyToUndefined,
    groupBy: z.enum(['day', 'month']).optional(),
});
