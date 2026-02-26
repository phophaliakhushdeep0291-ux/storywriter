import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { isStrongPassword } from "../utils/passwordValidator.js"
import {User} from "../models/mongo/user.model.js"
import { sendEmail } from "../utils/sendEmail.js"
import crypto from "crypto"
import { OTP } from "../models/mongo/otp.model.js"

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
    const isVerified = await OTP.findOne({ email, otp: "VERIFIED" })
    if(!isVerified) throw new ApiError(403, "Please verify your email first")

    const user=await User.create({
        email,
        username,
        password,
        isEmailVerified:true,
    })
    await OTP.deleteOne({ email })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    return res.status(201)
        .json(new ApiResponse(201,createdUser,"User registered successfully"))
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
const generateAndSendOTP=async(email,attempts=0)=>{
    const otp=Math.floor(Math.random()*900000)+100000
    const hashedOTP=crypto.createHash("sha256").update(otp.toString()).digest("hex")
    await OTP.deleteMany({email})
    await OTP.create({email,otp:hashedOTP,attempts})
    await sendEmail({
        to:email,
        subject: "Verify your email",
        message: `
            <h2>Your OTP for Anime Writer</h2>
            <p>Your verification code is:</p>
            <h1 style="color:#646cff">${otp}</h1>
            <p>This OTP expires in 10 minutes.</p>
        `
    })
}
const sendOTP=asyncHandler(async(req,res)=>{
    const {email}=req.body
    if(!email){
        throw new ApiError(400,"Email is required")
    }
    await generateAndSendOTP(email,0)
    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    )
})
const verifyOTP=asyncHandler(async(req,res)=>{
    const {email,otp}=req.body
    if(!email||!otp)throw new ApiError(404,"Email and OTP are required")
    const hashedOTP=crypto.createHash("sha256").update(otp.toString()).digest("hex")
    const otpRecord=await OTP.findOne({
        email,
        otp:hashedOTP,
        expiry:{$gt:Date.now()}
    })
    if(!otpRecord)throw new ApiError(400,"Invalid or expired OTP")
    await OTP.deleteOne({email})
    await OTP.create({ email, otp: "VERIFIED", expiry: new Date(Date.now() + 10 * 60 * 1000) })
    return res.status(200).json(
        new ApiResponse(200, { email }, "OTP verified successfully")
    )
})
const resendOTP=asyncHandler(async(req,res)=>{
    const {email}=req.body
    if(!email)throw new ApiError(400,"Email is required")
    
    const existingOTP=await OTP.findOne({email})
    if(existingOTP&&existingOTP.attempts>=10){
        throw new ApiError(429,"OTP request limit reached. Try again later.")
    }
    await generateAndSendOTP(email,(existingOTP?.attempts||0)+1)
    return res.status(200).json(new ApiResponse(200,{},"OTP resend successfully"))

})
export{
    registration,
    login,
    logoutUser,
    sendOTP,     
    verifyOTP, 
    resendOTP,
}