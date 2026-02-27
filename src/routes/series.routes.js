import {
    createSession,
    chatWithAgent,
    confirmIdea,
    chatstructureAgent,
} from "../controllers/series.controller.js"
import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/session", verifyJWT, createSession)
router.post("/chat", verifyJWT, chatWithAgent)
router.post("/confirm-idea", verifyJWT, confirmIdea)
router.post("/create-structure", verifyJWT, chatstructureAgent)

export default router