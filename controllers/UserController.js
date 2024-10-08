import User from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
export const getProfileByUserId=async(req,res,next)=>{
    try {
        const {userId}=req.query;
        const user=await User.findById(userId);
        if(!user){
            return next(new ErrorHandler("User not found",404));
        }
        user.password=undefined;
        sendResponse({
            res,
            message:"Profile updated successfully",
            data:user
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

export const updateProfileInfo=async(req,res,next)=>{
    try {
        const {username,email,mobile,userId}=req.body;
        const user=await User.findById(userId);
        if(!user){
            return next(new ErrorHandler("User not found",404));
        }
        
        const updateProfile=await User.findByIdAndUpdate(userId,{
            image:req?.file?.path,
            username,
            email,
            mobile
        },{new:true});
        console.log(updateProfile)
        if(!updateProfile){
            return next(new ErrorHandler("User not found",400));
        }
        sendResponse({
            res,
            message:"Profile updated successfully",
            data:updateProfile
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}
