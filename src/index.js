import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import connectMongoDB from "./config/db.mongo.js"
import connectPostgres from "./config/db.postgres.js"
import logger from "./utils/logger.js"
import { app } from "./app.js"; //THIS LINE WAS MISSING

connectMongoDB()
    .then(()=>{
        app.listen(process.env.PORT|| 8000,()=>{
            logger.info(`Server is running at port : ${process.env.PORT||8000}`)
        })
    })
    .catch((err)=>{
        
        logger.error(`Database connection failed: ${err.message}`)
        process.exit(1)   
    })