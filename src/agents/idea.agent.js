import Groq from "groq-sdk";
import { ideaPrompt } from "../prompts/idea.prompt.js";
import {IdeaSession} from "../models/mongo/ideaSession.model.js"
import logger from "../utils/logger.js";
import { ApiError } from "../utils/ApiError.js"

const groq= new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
const ideaAgent=async(sessionId, userMessage)=>{
    try {
        const session=await IdeaSession.findById(sessionId);
        if(!session)throw new ApiError(404,"Session not found");

        session.conversation.push({
            role:"user",
            content:userMessage,
        });
        const messages = [
            { role: "system", content: ideaPrompt },
            ...session.conversation.map(msg => ({
                role: msg.role,
                content: msg.content,
            }))
        ];

        // Call Groq API
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.9, // higher = more creative
            max_tokens: 2000,
        });

        const aiMessage = response.choices[0].message.content;

        // Add AI response to conversation history
        session.conversation.push({
            role: "assistant",
            content: aiMessage,
        });

        // Increment debate rounds
        session.debate_rounds += 1;

        // Save updated session
        await session.save();

        logger.info(`Idea agent responded - Session: ${sessionId}, Round: ${session.debate_rounds}`);

        return aiMessage;

    } catch (error) {
        logger.error(`Idea agent failed: ${error.message}`);
        throw error;
    }
};
export {
    ideaAgent,
};