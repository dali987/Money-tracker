import { Router } from 'express';
import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
} from '../controllers/budget.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

import { validate } from '../middlewares/validate.middleware.js';
import { createBudgetSchema, updateBudgetSchema } from '../schemas/budget.schema.js';

const budgetRouter = Router();

budgetRouter.use(authorizeToken);

budgetRouter.post('/create', validate(createBudgetSchema), createBudget);
budgetRouter.get('/', getBudgets);
budgetRouter.put('/update/:id', validate(updateBudgetSchema), updateBudget);
budgetRouter.delete('/delete/:id', deleteBudget);

export default budgetRouter;
