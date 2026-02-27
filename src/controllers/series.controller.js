import { IdeaSession } from "../models/mongo/ideaSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ideaAgent}from "../agents/idea.agent.js";
import logger from "../utils/logger.js";
import { structureAgent } from "../agents/structure.agent.js";

const createSession=asyncHandler(async(req,res)=>{
    const {raw_idea}=req.body
    if(!raw_idea){
       throw new ApiError(400,"There is no new Idea");
    }
    const ideaSession=await IdeaSession.create({
        owner:req.user._id,
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
const confirmIdea=asyncHandler(async(req,res)=>{
    const {ideaSessionId,final_idea}=req.body
    if(!final_idea||!ideaSessionId)throw new ApiError(404,"")
    const ideasession=await IdeaSession.findById(ideaSessionId)
    if(!ideasession) throw new ApiError(404, "Session not found")
    ideasession.final_idea=final_idea
    ideasession.status="confirmed"
    await ideasession.save()
    
    return res.status(200)
        .json(new ApiResponse(200,ideasession,"Final idea confirmed successfully"))
})
const chatstructureAgent=asyncHandler(async(req,res)=>{
    const { ideaSessionId } = req.body
    if(!ideaSessionId) throw new ApiError(400, "ideaSessionId is required")
    const responce=await structureAgent(ideaSessionId,req.user._id)
    return res.status(200)
        .json(new ApiResponse(200,responce,"Agent responded"))
})
export{
    createSession,
    chatWithAgent,
    confirmIdea,
    chatstructureAgent,
}