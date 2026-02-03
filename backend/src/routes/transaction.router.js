import { Router } from 'express';
import {
    createTransaction,
    getTransaction,
    getTransactionWithFilter,
    updateTransaction,
    deleteTransaction,
    calculateTransactionSum,
    getTransactionChartData,
    getNetWorthChartData,
} from '../controllers/transaction.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

import { validate } from '../middlewares/validate.middleware.js';
import { validateQuery } from '../middlewares/validateQuery.middleware.js';
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema.js';
import {
    transactionListQuerySchema,
    transactionChartQuerySchema,
    transactionNetWorthQuerySchema,
} from '../schemas/transactionQuery.schema.js';

const transactionRouter = Router();

transactionRouter.use(authorizeToken);

transactionRouter.post('/create', validate(createTransactionSchema), createTransaction);
transactionRouter.get('/get/:id', getTransaction);
transactionRouter.get('/', validateQuery(transactionListQuerySchema), getTransactionWithFilter);
transactionRouter.get(
    '/summary',
    validateQuery(transactionListQuerySchema),
    calculateTransactionSum,
);
transactionRouter.get('/chart', validateQuery(transactionChartQuerySchema), getTransactionChartData);
transactionRouter.get(
    '/net-worth-chart',
    validateQuery(transactionNetWorthQuerySchema),
    getNetWorthChartData,
);
transactionRouter.put('/update/:id', validate(updateTransactionSchema), updateTransaction);
transactionRouter.delete('/delete/:id', deleteTransaction);

export default transactionRouter;
