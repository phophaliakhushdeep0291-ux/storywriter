import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import logger from "../utils/logger.js"
import { isStrongPassword } from "../utils/passwordValidator.js"
import {User} from "../models/mongo/user.model.js"
import { sendEmail } from "../utils/sendEmail.js"
import crypto from "crypto"

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")

    }
}
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
    const {username,email,password}=req.body
    if(!username&&!email)throw new ApiError(400,"Username or Email is required");
    const user=await User.findOne({
        $or:[{email},{username}]
    })
    
    if(!user){
        throw new ApiError(404,"This user does not exist")
    }
    if(!user.isEmailVerified){
        throw new ApiError(403, "Please verify your email before logging in")
    }
    const isPasswordValid =await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"This password is not correct")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    
    const loggendInUser=await User.findById(user._id).select("-password -refreshToken")
   
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,
            {
                user:loggendInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
})
const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))
})
export{
    registration,
    emailVerification,
    login,
    logoutUser,
}