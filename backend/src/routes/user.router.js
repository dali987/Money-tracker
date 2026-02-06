
import { Router } from "express"
import { authorizeToken } from "../middlewares/auth.middleware.js"
import { addSetting, getSetting, getUser, removeSetting, updateSetting } from "../controllers/user.controller.js"
import { validate } from "../middlewares/validate.middleware.js"
import { addSettingSchema, removeSettingSchema, updateSettingSchema } from "../schemas/userSettings.schema.js"

const userRouter = Router()

userRouter.use(authorizeToken)

userRouter.get("/", getUser)
userRouter.get("/setting/:key", getSetting)
userRouter.post("/update", validate(updateSettingSchema), updateSetting)
userRouter.post("/add", validate(addSettingSchema), addSetting)
userRouter.post("/remove", validate(removeSettingSchema), removeSetting)


export default userRouter
