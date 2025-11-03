import { Router } from "express"
import { createAccount, getAccount, getUserAccounts } from "../controllers/account.controller.js"
import { authorizeToken } from "../middlewares/auth.middleware.js"

const accountRouter = Router()

accountRouter.use(authorizeToken)

accountRouter.post("/create", createAccount)
accountRouter.get("/", getUserAccounts)
accountRouter.get("/:id", getAccount)

export default accountRouter