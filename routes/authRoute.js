import express from "express";
import { forgetPassword, loginUser, registerUser, resendOtp, resetPassword, verifyOtp } from "../controllers/authController.js";
import Auth, { Admin } from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/register",registerUser);
router.post("/verify-otp",verifyOtp);
router.get("/resend-otp",resendOtp);
router.post("/login",loginUser);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",resetPassword);

router.get("/user-auth",Auth,(req,res)=>{
    res.send({
        ok:true
    });
})

router.get("/admin-auth",Auth,Admin,(req,res)=>{
    res.send({
        ok:true
    });
})



export default router;