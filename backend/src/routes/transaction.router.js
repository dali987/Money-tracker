import { Router } from "express";
import { createTransaction, getTransaction, getAccountTransactions, getUserTransactions, updateTransaction, deleteTransaction } from "../controllers/transaction.controller.js";
import { authorizeToken } from "../middlewares/auth.middleware.js";

const transactionRouter = Router()

transactionRouter.use(authorizeToken)

transactionRouter.post("/create", createTransaction)
transactionRouter.get("/account/:id", getAccountTransactions)
transactionRouter.get("/:id", getTransaction)
transactionRouter.get("/", getUserTransactions)
transactionRouter.put("/update/:id", updateTransaction)
transactionRouter.delete("/delete/:id", deleteTransaction)

export default transactionRouter