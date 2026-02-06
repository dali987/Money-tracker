
import { Router } from "express"
import { convertCurrency, getAllCurrencies, getExchangeRates, updateExchangeRates } from "../controllers/exchange.controller.js"
import { authorizeToken } from "../middlewares/auth.middleware.js"
import { validateQuery } from "../middlewares/validateQuery.middleware.js"
import { convertCurrencyQuerySchema } from "../schemas/exchange.schema.js"

const exchangeRouter = Router()

exchangeRouter.use(authorizeToken)

exchangeRouter.get("/convert", validateQuery(convertCurrencyQuerySchema), convertCurrency)
exchangeRouter.get("/currencies", getAllCurrencies)
exchangeRouter.get("/", getExchangeRates)
exchangeRouter.post("/update", updateExchangeRates)

export default exchangeRouter
