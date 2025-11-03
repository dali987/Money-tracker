import { Router } from "express"
import { getNewToken, signIn, signOut, signUp } from "../controllers/auth.controller.js"
import { verifyRefreshToken } from "../middlewares/auth.middleware.js"

const authRouter = Router()

authRouter.post("/sign-up", signUp)
authRouter.post("/login", signIn)
authRouter.post("/sign-out", signOut)
authRouter.get("/token", verifyRefreshToken, getNewToken)

export default authRouter