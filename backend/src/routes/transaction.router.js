import { Router } from 'express';
import {
    createTransaction,
    getTransaction,
    getTransactionWithFilter,
    updateTransaction,
    deleteTransaction,
} from '../controllers/transaction.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

const transactionRouter = Router();

transactionRouter.use(authorizeToken);

transactionRouter.post('/create', createTransaction);
transactionRouter.get('/:id', getTransaction);
transactionRouter.get('/', getTransactionWithFilter);
transactionRouter.put('/update/:id', updateTransaction);
transactionRouter.delete('/delete/:id', deleteTransaction);

export default transactionRouter;
