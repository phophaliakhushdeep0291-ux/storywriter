import Groq from "groq-sdk";
import logger from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js"
import {Structure} from "../models/mongo/structure.model.js"
import { structurePrompt } from "../prompts/structure.prompt.js";
import { IdeaSession } from "../models/mongo/ideaSession.model.js";

const structureAgent=async(ideaSessionId,userId)=>{
    try {
        const ideaSession=await IdeaSession.findById(ideaSessionId)
        if(!ideaSession)throw new ApiError(404,"Idea session not found")
        const message=ideaSession.final_idea
        if(!message)throw new ApiError(400,"NO final idea confirmed yet")
        const groq=new Groq({
            apiKey: process.env.GROQ_API_KEY,
        })
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: structurePrompt },
                { role: "user", content: message }
            ],
            temperature: 0.8,
            max_tokens: 4000,
        })
        const aiMessage= response.choices[0].message.content
        const parsedStructure =JSON.parse(aiMessage)
        const structure=await Structure.create({
            owner:userId,
            ideaSession:ideaSessionId,
            ...parsedStructure
        })
        logger.info(`Structure agent completed for session: ${ideaSessionId}`)
        return structure
    } catch (error) {
        logger.error(`Structure agent failed: ${error.message}`)
        throw error
    }
}
export {structureAgent}