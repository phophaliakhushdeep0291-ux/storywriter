import mongoose from "mongoose";
import logger from "../utils/logger.js"
import {DB_NAME} from"../constants.js"
const connectMongoDB=async()=>{
    try{
        const connection =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        logger.info(`MongoDB connected: ${connection.connection.host}`)
    }catch(error){
        logger.error(`MongoDB connection failed: ${error.message}`)
        process.exit(1)
    }
}

export default connectMongoDB