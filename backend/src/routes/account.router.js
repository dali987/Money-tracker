import { Router } from 'express';
import {
    createAccount,
    deleteAccount,
    getAccount,
    getUserAccounts,
    updateAccount,
    getAccountsSummary,
} from '../controllers/account.controller.js';
import { authorizeToken } from '../middlewares/auth.middleware.js';

import { validate } from '../middlewares/validate.middleware.js';
import { createAccountSchema, updateAccountSchema } from '../schemas/account.schema.js';

const accountRouter = Router();

accountRouter.use(authorizeToken);

accountRouter.post('/create', validate(createAccountSchema), createAccount);
accountRouter.put('/update/:id', validate(updateAccountSchema), updateAccount);
accountRouter.delete('/delete/:id', deleteAccount);
accountRouter.get('/summary', getAccountsSummary);
accountRouter.get('/', getUserAccounts);
accountRouter.get('/:id', getAccount);

export default accountRouter;
