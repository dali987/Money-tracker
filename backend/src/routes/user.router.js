
import { Router } from "express"
import { authorizeToken } from "../middlewares/auth.middleware.js"
import { addTag, deleteTag, getTags, getUser } from "../controllers/user.controller.js"

const userRouter = Router()

userRouter.use(authorizeToken)

userRouter.get("/", getUser)
userRouter.get("/tags", getTags)
userRouter.post("/tags", addTag)
userRouter.delete("/tags", deleteTag)

export default userRouter