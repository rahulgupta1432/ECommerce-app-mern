import mongoose from "mongoose";

const mobileVerificationSchema=new mongoose.Schema({
    mobile:{
        type:Number,
        required:true
    },
    otp:{
        type:Number,
        required:true
    },
    expiresAt:{
        type:Date,
        default:()=>new Date(Date.now()+60*5000)
    }
},{
    timestamps:true
});

mobileVerificationSchema.index({expiresAt:5},{expireAfterSeconds:0})

const MobileVerification=mongoose.model(
    "MobileVerification",
    mobileVerificationSchema
);

export default MobileVerification;

