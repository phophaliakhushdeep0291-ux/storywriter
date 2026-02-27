import cron from "node-cron"
import { OTP } from "../models/mongo/otp.model.js"
import logger from "./logger.js"

export const startCleanupJobs = () => {
    
    cron.schedule("0 * * * *", async () => {
        const result=await OTP.deleteMany({
            expiry:{$lt:Date.now()}
        })
        logger.info(`Cleanup: deleted ${result.deletedCount} expired OTPs`)
    })
}