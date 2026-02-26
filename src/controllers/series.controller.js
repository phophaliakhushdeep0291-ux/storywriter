import { IdeaSession } from "../models/mongo/ideaSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ideaAgent}from "../agents/idea.agent.js";
import logger from "../utils/logger.js";

const createSession=asyncHandler(async(req,res)=>{
    const {raw_idea}=req.body
    if(!raw_idea){
       throw new ApiError(400,"There is no new Idea");
    }
    const ideaSession=await IdeaSession.create({
        // owner:req.user._id,
        raw_idea,
    })
    return res.status(201).json(
        new ApiResponse(201,ideaSession,"Session created successfully")
    )
})
const chatWithAgent=asyncHandler(async(req,res)=>{
    const {sessionId,userMessage}=req.body
    if(!sessionId){
        throw new ApiError(400,"No session id");
    }
    if(!userMessage){
        throw new ApiError(400,"No message provided")
    }
    const response=await ideaAgent(sessionId,userMessage)
    return res.status(200)
        .json(new ApiResponse(200,response,"Agent responded"))
})
export{
    createSession,
    chatWithAgent,
}