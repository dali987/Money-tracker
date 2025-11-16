import express from "express"
import next from "next"
import { ENV } from "./lib/env.js"
import connectToDatabase from "./database/mongodb.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import accountRouter from "./routes/account.router.js"
import transactionRouter from "./routes/transaction.router.js"
import userRouter from "./routes/user.router.js"
import exchangeRouter from "./routes/exchange.router.js"
import helmet from "helmet"
import rateLimit  from "express-rate-limit" 

const dev = ENV.NODE_ENV !== "production"
const nextApp = next({ dev, dir: "../frontend"})
const handle = nextApp.getRequestHandler()

const PORT = ENV.PORT

const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 15,              // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // ✅ Ignore Next.js internal/static requests
    return (
      req.url.startsWith("/_next/") ||  // Next.js internals
      req.url.startsWith("/static/") || // Static files (if you have any)
      req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$/i) // Static assets
    );
  },
});

nextApp.prepare().then(() =>{
    const app = express()

    app.use(cookieParser())
    app.use(express.json())
    // app.use(limiter)
    // app.use(helmet({
    //     contentSecurityPolicy: {
    //         useDefaults: true,
    //         directives: {
    //             "default-src": ["'self'"],
    //             "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    //             "connectSrc": ["'self'", "http://localhost:3000"],
    //             "styleSrc": ["'self'", "'unsafe-inline'"],
    //             "imgSrc": ["'self'", "data:", "https:"],
    //         },
    //     },
    // }))

    const apiRouter = express.Router() //

    apiRouter.use("/auth", authRouter)
    apiRouter.use("/account", accountRouter)
    apiRouter.use("/transaction", transactionRouter)
    apiRouter.use("/user", userRouter)
    apiRouter.use("/exchange", exchangeRouter)

    app.use("/api/v1", apiRouter)

    app.use(errorMiddleware)

    app.all(/.*/, (req, res) => {
        return handle(req, res)
    })

    app.listen(PORT, async () =>{
        console.log("server is up, port: ", PORT)

        await connectToDatabase()
    })
})