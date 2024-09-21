import { loginValidation, registerUserValidation, verifyOtpValidation } from "../helper/validation.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import generateToken from "../utils/generateToken.js";
import sendResponse from "../utils/sendResponse.js";
import MobileVerification from "../models/mobileVerificationModel.js"
import { sendMessageFast2Sms } from "../helper/sendMessage.js";
import { sendEmail } from "../helper/sendMail.js";

export const registerUser=async(req,res,next)=>{
    try {
        const { username,email,password,mobile,role } = req.body;
        const valid=await registerUserValidation(req.body);
        if(!valid||(valid&&valid.error)){
            console.log("valid",valid.error)
            return next(new ErrorHandler(valid.error,400));
        }
        const checkExist=await User.findOne({
            $or: [
                { mobile: mobile ? mobile : null },
                { email: email ? email : null }
            ]
        });
        if(checkExist){
            return next(new ErrorHandler("User Already Existed",400));
        }
        
        const userEmail = email || `${username}@gmail.com`;
        const user= await User.create({ username, email:userEmail, password,mobile,role });
        // const token=await generateToken(user.id,user.isAdmin,role,user.tokenVersion);
        user.password=undefined;
        const data={...user.toObject()}
        const otp=Math.floor(1000+Math.random()*9000);
        const verificationData = mobile ? { mobile, otp } : { email: userEmail, otp };
        const checkOtp = await MobileVerification.findOne({
            $or: [
                { mobile: verificationData.mobile },
                { email: verificationData.email }
            ]
        });

        if(!checkOtp){
        const verification=await MobileVerification.create(verificationData);
        }
        let message;
        if (mobile) {
            const payloadSms = {
                mobile: mobile.toString(),
                otp
            };
            message = await sendMessageFast2Sms(payloadSms);
        }
        if (email) {
            const ip = req.ip || "127.0.0.1";
            const date = Date.now().toString();
            
            // Pass each parameter directly instead of bundling them
            message = await sendEmail(otp, ip, date, userEmail);
        }
        
        // } else if (email) {
        //     const userEmail = "attendance@gncasc.org";
        //     console.log("email",email)
        //     const payloadMail = {
        //         // email: email.toString(),
        //         otp,
        //         ip: req.ip || "127.0.0.1", // Use the user's real IP if available
        //         date: Date.now().toString(),
        //         email:userEmail.toString()
        //     };
        //     console.log("63",payloadMail)
        //     message = await sendEmail(payloadMail);
        // }
        // if(!message){
        //         return next(new ErrorHandler("Error Sending in Message",500));
        //     }
        sendResponse({
            res,
            message: "User Register Successfully",
            data: data,
          });
          
    } catch (error) {
        console.log("error",error)
        return next(new ErrorHandler(error.message,500));
    }
}


export const verifyOtp=async(req,res,next)=>{
    try {
        const {email,mobile,otp}=req.body;
        const valid=await verifyOtpValidation(req.body);
        if(!valid||(valid&&valid.error)){
            return next(new ErrorHandler(valid.error,400));
        }
        const checkUserOtp=await MobileVerification.findOne({
            $or: [
                { mobile: mobile },
                { email: email }
            ]
        });
        if(!checkUserOtp){
            return next(new ErrorHandler("User not found",404));
        }
        if(checkUserOtp.otp!=otp){
            return next(new ErrorHandler("Invalid OTP Please try again",404));
        }
        const checkUser=await User.findOne({
            $or: [
                { mobile: mobile },
                { email: email }
            ]
        });
        if(!checkUser){
            return next(new ErrorHandler("User not found",404));
        }
        checkUserOtp.isVerified=true;
        checkUserOtp.save();
        const token=await generateToken(checkUser.id,checkUser.isAdmin,checkUser.role,checkUser.tokenVersion);
        checkUser.password=undefined;
        const data={token,role:checkUser.role,username:checkUser.username}
        sendResponse({
            res,
            message: "OTP Verified Successfully",
            data: data,
          });
        
    } catch (error) {
        console.log("error",error);
        return next(new ErrorHandler(error.message,500))
    }
}

export const resendOtp=async(req,res,next)=>{
    try {
        const {email,mobile}=req.query;
        const checkUser=await User.findOne({$or:[
            {email},
            {mobile}
        ]})
        if(!checkUser){
            return next(new ErrorHandler("User not found",404));
        }
        if(checkUser.isVerified){
            return next(new ErrorHandler("User already verified",400));
        }
        const checkExistOtp=await MobileVerification.findOne({
            $or: [
                { mobile: mobile },
                { email: email }
            ]
        });
        const otp=Math.floor(1000+Math.random()*9000);
        // const verificationData = mobile ? { mobile, otp } : { email: email, otp };
        if(checkExistOtp){
            checkExistOtp.otp=otp;
         await checkExistOtp.save();
        }else{
            const verificationData = mobile ? { mobile, otp } : { email, otp };
            await MobileVerification.create(verificationData);
        }
            
        if(mobile){
            const payloadSms = {
                mobile: mobile.toString(),
                otp
            };
            const message = await sendMessageFast2Sms(payloadSms);
            if(!message){
                return next(new ErrorHandler("Error Sending in Message",500));
            }
        }
        if(email){
            const ip=req.ip||"127.0.0.1";
            const date=Date.now().toString();
            const message = await sendEmail(otp,ip,date,email);
            if(!message){
                return next(new ErrorHandler("Error Sending in Message",500));
            }
        }

        

        sendResponse({
            res,
            message: "OTP Resend Successfully",
            data: null,
          });
    }catch(error){
        console.log(error)
        return next(new ErrorHandler(error.message,500))
    }
}


export const loginUser=async(req,res,next)=>{
    try {
        const { email,password } = req.body;
        const valid=await loginValidation(req.body);
        if(!valid||(valid&&valid.error)){
            return next(new ErrorHandler(valid.error,400));
        }
        const user=await User.findOne({email});
        if(!user){
            return next(new ErrorHandler("Invalid Email or Password",404));
        }
        const checkPassword=await user.comparePassword(password);
        if(!checkPassword){
            return next(new ErrorHandler("Invalid Password",404));
        }
        const token=await generateToken(user.id,user.isAdmin,user.role,user.tokenVersion);
        user.password=undefined;
        const data={...user.toObject(),token}
        sendResponse({
            res,
            message: "User Login Successfully",
            data: data,
          });
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}