import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import logger from "../utils/logger.js"
import { isStrongPassword } from "../utils/passwordValidator.js"
import {User} from "../models/mongo/user.model.js"
import { sendEmail } from "../utils/sendEmail.js"


const registration=asyncHandler(async(req,res)=>{
    const { email, username, password } = req.body

    if(!email || !username || !password){
        throw new ApiError(400, "Email, username and password are required")
    }
    if(!isStrongPassword(password)){
        throw new ApiError(400,"Password must be at least 8 characters with uppercase, lowercase, number and special character")
    }
    const userexist=await User.findOne({$or:[{email},{username}]});
    if(userexist){
        throw new ApiError(400,"This user already exist")
    }
    

    const user=await User.create({
        email,
        username,
        password,
    })
    const token=user.generateEmailVerificationToken()
    await user.save({validateBeforeSave:false})
    await sendEmail({
        to:user.email,
        subject:"VErify your email",
        message:`Click this link to verify: ${process.env.FRONTEND_URL}/verify-email/${token}`
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    return res.status(201)
        .json(new ApiResponse(201,createdUser,"Registration successful. Please verify your email."))
})
const emailVerification=asyncHandler(async(req,res)=>{
    const {token}=req.params
    if(!token){
        throw new ApiError(400,"This Email is not verified")
    }
    const  hashedToken=crypto.createHash("sha256").update(token).digest("hex")
    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user) throw new ApiError(400, "Invalid or expired token")
    user.isEmailVerified=true
    user.emailVerificationToken=undefined
    user.emailVerificationExpiry=undefined
    await user.save({validateBeforeSave:false})
    return res.status(200)
        .json(new ApiResponse(200,{},"Email verified successfully"))
})
const login=asyncHandler(async(req,res)=>{
    
})