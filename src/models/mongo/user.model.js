import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
        },
        emailVerificationExpiry: {
            type: Date,
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};
userSchema.methods.generateEmailVerificationToken=function(){
    const token=crypto.randomBytes(32).toString("hex")
    this.emailVerificationToken=crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
    this.emailVerificationExpiry=Date.now()+24*60*60*1000
    return token
}
userSchema.methods.generatePasswordResetToken=function(){
    const token=crypto.randomBytes(32).toString("hex")
    this.forgotPasswordToken=crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
    this.forgotPasswordExpiry=Date.now()+10*60*1000
    return token
}

export const User = mongoose.model("User", userSchema);