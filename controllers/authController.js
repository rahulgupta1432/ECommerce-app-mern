import { registerUserValidation } from "../helper/validation.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";


export const registerUser=async(req,res,next)=>{
    try {
        const { name,email,password,phone,address } = req.body;
        const valid=await registerUserValidation(req.body);
        if(!valid||(valid&&valid.error)){
            console.log("valid",valid.error)
            return next(new ErrorHandler(valid.error,400));
        }
        const checkEmail=await User.findOne({email});
        if(checkEmail){
            return next(new ErrorHandler("User Already Existed",404));
        }
        let user;
        user= await User.create({ name, email, password,phone,address });
        const token=await generateToken(user.id,user.isAdmin,role,user.tokenVersion);
        user.password=undefined;
        const data={...user.dataValues,token}
        sendResponse({
            res,
            message: "User Register Successfully",
            data: data,
          });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}