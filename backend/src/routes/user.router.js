
import { Router } from "express"
import { authorizeToken } from "../middlewares/auth.middleware.js"
import { addSetting, getSetting, getUser, removeSetting, updateSetting } from "../controllers/user.controller.js"

const userRouter = Router()

userRouter.use(authorizeToken)

userRouter.get("/", getUser)
userRouter.get("/setting/:key", getSetting)
userRouter.post("/update", updateSetting)
userRouter.post("/add", addSetting)
userRouter.post("/remove", removeSetting)


export default userRouter