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
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema.js';

const transactionRouter = Router();

transactionRouter.use(authorizeToken);

transactionRouter.post('/create', validate(createTransactionSchema), createTransaction);
transactionRouter.get('/get/:id', getTransaction);
transactionRouter.get('/', getTransactionWithFilter);
transactionRouter.get('/summary', calculateTransactionSum);
transactionRouter.get('/chart', getTransactionChartData);
transactionRouter.get('/net-worth-chart', getNetWorthChartData);
transactionRouter.put('/update/:id', validate(updateTransactionSchema), updateTransaction);
transactionRouter.delete('/delete/:id', deleteTransaction);

export default transactionRouter;
