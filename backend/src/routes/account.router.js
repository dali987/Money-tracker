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

const accountRouter = Router();

accountRouter.use(authorizeToken);

accountRouter.post('/create', createAccount);
accountRouter.put('/update/:id', updateAccount);
accountRouter.delete('/delete/:id', deleteAccount);
accountRouter.get('/summary', getAccountsSummary);
accountRouter.get('/', getUserAccounts);
accountRouter.get('/:id', getAccount);

export default accountRouter;
