import { loginValidation, registerUserValidation } from "../helper/validation.js";
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
        const checkEmail=await User.findOne({mobile});
        if(checkEmail){
            return next(new ErrorHandler("User Already Existed",404));
        }
        let user;
        user= await User.create({ username, email:`${username}@gmail.com`, password,mobile,role });
        const token=await generateToken(user.id,user.isAdmin,role,user.tokenVersion);
        user.password=undefined;
        const data={...user.toObject(),token}
        const checkOtp=await MobileVerification.findOne({
            mobile
        })
        const otp=Math.floor(1000+Math.random()*9000);
        if(!checkOtp){
        const verification=await MobileVerification.create({
            mobile,otp
        })
        }
        const payload={
            mobile: mobile.toString(),
        otp: otp.toString()
        }
        const checkUser=await User.findOne({mobile});
        if(checkUser){
            console.log("inside otp")
            // const message=await sendMessageFast2Sms(payload);
            const message=await sendEmail(otp.toString(),"127.0.0.1",Date.now().toString())
        if(!message){
                return next(new ErrorHandler("Error Sending in Message",500));
            }
        }
        sendResponse({
            res,
            message: "User Register Successfully",
            data: data,
          });
          
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
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