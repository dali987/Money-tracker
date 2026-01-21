import { Router } from 'express';
import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
} from '../controllers/budget.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

const budgetRouter = Router();

budgetRouter.use(authorizeToken);

budgetRouter.post('/create', createBudget);
budgetRouter.get('/', getBudgets);
budgetRouter.put('/update/:id', updateBudget);
budgetRouter.delete('/delete/:id', deleteBudget);

export default budgetRouter;
