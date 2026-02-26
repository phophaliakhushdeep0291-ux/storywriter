import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registration,
    login,
    logoutUser,
    sendOTP,
    verifyOTP,
    resendOTP,
} from "../controllers/user.controller.js"

const router=Router();
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)
router.post("/register", registration)
router.post("/login", login)
router.post("/logout", verifyJWT, logoutUser)
router.post("/resend-otp",resendOTP)
export default router