import mongoose,{Schema} from "mongoose";

const OTPschema=new Schema(
    {
        email:{
            type:String,
            required:true
        },
        otp:{
            type:String,
            required:true
        },
        expiry:{
            type:Date,
            default:()=> new Date(Date.now()+10*60*1000)
        },
        attempts: {
            type: Number,
            default: 0
        },
},{timestamps:true})

export const OTP=mongoose.model("OTP",OTPschema)