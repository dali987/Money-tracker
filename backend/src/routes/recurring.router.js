import { Router } from 'express';
import {
    createRecurringTransaction,
    deleteRecurringTransaction,
    getRecurringTransactions,
    updateRecurringTransaction,
} from '../controllers/recurring.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

import { validate } from '../middlewares/validate.middleware.js';
import {
    createRecurringTransactionSchema,
    updateRecurringTransactionSchema,
} from '../schemas/recurring.schema.js';

const recurringRouter = Router();

recurringRouter.use(authorizeToken);

recurringRouter.post(
    '/create',
    validate(createRecurringTransactionSchema),
    createRecurringTransaction,
);
recurringRouter.get('/', getRecurringTransactions);
recurringRouter.put(
    '/update/:id',
    validate(updateRecurringTransactionSchema),
    updateRecurringTransaction,
);
recurringRouter.delete('/delete/:id', deleteRecurringTransaction);

export default recurringRouter;
