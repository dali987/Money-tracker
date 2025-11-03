import mongoose, { mongo } from "mongoose"
import { ENV } from "../lib/env.js"

const connectToDatabase = async () =>{
    try{

        const { MONGO_URI } = ENV
        if (!MONGO_URI) throw new Error("MONGO_URI is not set")

        await mongoose.connect(MONGO_URI)

        console.log(`Connected to database in ${ENV.NODE_ENV} mode`)
    }
    catch (error){
        console.error('Error connecting to database: ', error)

        process.exit(1)
    }
}

export default connectToDatabase