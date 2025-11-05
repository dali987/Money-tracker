import { Router } from "express";
import { createTransaction, getTransaction, getUserTransactions } from "../controllers/transaction.controller.js";
import { authorizeToken } from "../middlewares/auth.middleware.js";

const transactionRouter = Router()

transactionRouter.use(authorizeToken)

transactionRouter.post("/create", createTransaction)
transactionRouter.get("/account/:id", getUserTransactions)
transactionRouter.get("/:id", getTransaction)

export default transactionRouter