import mongoose from "mongoose"
import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import { createToken, getRefreshToken } from "../lib/utils.js"
import { ENV } from "../lib/env.js"
import jwt from "jsonwebtoken"
import redisClient from "../database/redisClient.js"

export const signUp = async (req, res, next) =>{
    const session = await mongoose.startSession()
    session.startTransaction()
    try{
        const { username, email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser){
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)


        const newUsers = await User.create([{username, email, password: hashedPassword}], { session})

        const newUser = newUsers[0]

        newUser.password = undefined

        const accessToken = createToken(newUser._id, "access", ENV.JWT_ACCESS_TOKEN_EXPIRE)
        await getRefreshToken(res, next, newUser._id, false)

        await session.commitTransaction()


        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                accessToken,
                user: newUser,
            }
        })
    }
    catch (error){
        console.error("An error occurred while signing up: ", error)
        await session.abortTransaction()
        next(error)
    }
    finally{
        session.endSession()
    }
}

export const signIn = async (req, res, next) =>{
    try{
        const { email, password, rememberMe } = req.body

        const user = await User.findOne({ email })
        if (!user){
            const error = new Error('User does not exist');
            error.statusCode = 409;
            throw error
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid){
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        user.password = undefined

        await getRefreshToken(res, next, user._id, rememberMe)
        const accessToken = createToken(user._id, "access", ENV.JWT_ACCESS_TOKEN_EXPIRE)

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                accessToken,
                user
            }
        })
    }
    catch (error){
        console.error("An error occurred while signing in: ", error)
        next(error)
    }
}

export const signOut = async (req, res, next) => {
    try{
        const refreshToken = req.cookies.refreshToken

        console.log(req.cookies)

        
        if (!refreshToken) return res.status(400).json({ message: "No refresh token provided" })
        
        const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_TOKEN_SECRET)

        await redisClient.del(decoded.userId.toString())

        res.clearCookie("refreshToken", {
                httpOnly: true,               
                secure: false,           
                sameSite: 'lax',  
                path: "/"
            });

        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error){
        console.error("An error occurred while signing out: ", error)
        next(error)
    }
}

export const getNewToken = async (req, res) =>{

    // before it is the verify refresh token middleware so the userId is 100% in the req
    try{
        const userId = req.userId

    // creating a new access token
        const accessToken = createToken(userId, "access", ENV.JWT_ACCESS_TOKEN_EXPIRE)

        return res.json({status: true, message: "success", data: accessToken});
    }
    catch (error){
        console.error("An error occurred while getting new token: ", error)
        next(error)
    }
}