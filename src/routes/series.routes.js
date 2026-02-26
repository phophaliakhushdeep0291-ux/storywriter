import {
    createSession,
    chatWithAgent,
} from "../controllers/series.controller.js"
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();


router.post("/session",verifyJWT,createSession)
router.post("/chat",verifyJWT,chatWithAgent)
export default router