import { Router } from "express";
import { createTransaction, getTransaction, getUserTransactions } from "../controllers/transaction.controller";
import { authorizeToken } from "../middlewares/auth.middleware.js";

const transactionRouter = Router()

transactionRouter.use(authorizeToken)

transactionRouter.post("/create", createTransaction)
transactionRouter.get("/", getUserTransactions)
transactionRouter.get("/:id", getTransaction)

export default transactionRouter