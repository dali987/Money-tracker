import express from "express"
import next from "next"
import { ENV } from "./lib/env.js"
import connectToDatabase from "./database/mongodb.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import accountRouter from "./routes/account.router.js"
import transactionRouter from "./routes/transaction.router.js"

const dev = ENV.NODE_ENV !== "production"
const nextApp = next({ dev, dir: "../frontend"})
const handle = nextApp.getRequestHandler()

const PORT = ENV.PORT

nextApp.prepare().then(() =>{
    const app = express()

    app.use(cookieParser())
    app.use(express.json())

    const apiRouter = express.Router()

    apiRouter.use("/auth", authRouter)
    apiRouter.use("/account", accountRouter)
    apiRouter.use("/transaction", transactionRouter)

    app.use("/api/v1", apiRouter)
    app.get("/test", (req, res) => {
        console.log("Cookies:", req.cookies);
        res.json(req.cookies);
    });

    app.use(errorMiddleware)

    app.all(/.*/, (req, res) => {
        return handle(req, res)
    })

    app.listen(PORT, async () =>{
        console.log("server is up, port: ", PORT)

        await connectToDatabase()
    })
})