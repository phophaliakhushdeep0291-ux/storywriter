import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registration,
    emailVerification,
    login,
    logoutUser,
} from "../controllers/user.controller.js"

const router=Router();
router.post("/register",registration)
router.get("/verify-email/:token",emailVerification)
router.post("/login",login)
router.post("/logout",verifyJWT,logoutUser)
export default router