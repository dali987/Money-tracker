
import { Router } from "express"
import { authorizeToken } from "../middlewares/auth.middleware.js"
import { getUser } from "../controllers/user.controller.js"

const userRouter = Router()

userRouter.get("/", authorizeToken, getUser)

export default userRouter