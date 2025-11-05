import ms from "ms"
import jwt from "jsonwebtoken"
import { ENV } from "./env.js"
import redisClient from "../database/redisClient.js"

/**
* @param {"access" | "refresh"} type
*/

export const createToken = (userId, type, period) =>{
    const token = jwt.sign({ userId }, ENV[`JWT_${type.toUpperCase()}_TOKEN_SECRET`], {expiresIn: ms(period)})

    return token
}

export const getRefreshToken = async (res, next, userId, rememberMe) =>{
    try{
        const period = rememberMe ? ENV.JWT_REFRESH_TOKEN_EXPIRE_REMEMBER_ME : ENV.JWT_REFRESH_TOKEN_EXPIRE

        const refreshToken = createToken(userId, "refresh", period)

        redisClient.set(userId.toString(), JSON.stringify({ refreshToken: refreshToken }))

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: ms(period),
            secure: false,
            sameSite: "lax",
            path: "/"
        })

        return refreshToken
    }
    catch (error){
        console.error("Error while making the refresh token: ", error)
        next(error)
    }
}

