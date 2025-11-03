import jwt from "jsonwebtoken"
import { ENV } from "../lib/env.js"
import User from "../models/user.model.js"
import redisClient from "../database/redisClient.js"

export const authorizeToken = async (req, res, next) =>{
    try{
        let token

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) return res.status(401).json({message: "Unauthorized"})

        const decoded = jwt.verify(token, ENV.JWT_ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded.userId).select("-password")

        if (!user) return res.status(401).json({message: "Unauthorized"})

        req.user = user

        next()
    }
    catch (error){
        console.error("Error while authorizing the token: ", error)
        next(error)
    }
}

export const verifyRefreshToken = async (req, res, next) =>{

    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No refresh token provided." });
    }

    try{
        
        const decoded = jwt.verify(token, ENV.JWT_REFRESH_TOKEN_SECRET)

        const storedRefreshTokenData = await redisClient.get(decoded.userId.toString())
        if (!storedTokenData) {
            return res.status(401).json({ message: "Unauthorized: Invalid session." });
        }

        const { refreshToken : storedRefreshToken } = JSON.parse(storedRefreshTokenData)

        if (storedRefreshToken != token){
            return res.status(401).json({message: "Unauthorized: Invalid token." });
        }

        next()

    }
    catch (error){
        return res.status(401).json({ message: "Unauthorized: Session has expired or is invalid." });
    }
}