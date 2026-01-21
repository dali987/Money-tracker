import { Router } from 'express';
import {
    createRecurringTransaction,
    deleteRecurringTransaction,
    getRecurringTransactions,
    updateRecurringTransaction,
} from '../controllers/recurring.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

const recurringRouter = Router();

recurringRouter.use(authorizeToken);

recurringRouter.post('/create', createRecurringTransaction);
recurringRouter.get('/', getRecurringTransactions);
recurringRouter.put('/update/:id', updateRecurringTransaction);
recurringRouter.delete('/delete/:id', deleteRecurringTransaction);

export default recurringRouter;
