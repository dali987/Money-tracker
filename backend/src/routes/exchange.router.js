
import { Router } from "express"
import { convertCurrency, getAllCurrencies, getExchangeRates, updateExchangeRates } from "../controllers/exchange.controller.js"
import { authorizeToken } from "../middlewares/auth.middleware.js"

const exchangeRouter = Router()

exchangeRouter.use(authorizeToken)

exchangeRouter.get("/convert", convertCurrency)
exchangeRouter.get("/currencies", getAllCurrencies)
exchangeRouter.get("/", getExchangeRates)
exchangeRouter.post("/update", updateExchangeRates)

export default exchangeRouter