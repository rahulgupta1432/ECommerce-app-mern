import express from "express";
import { loginUser, registerUser, resendOtp, verifyOtp } from "../controllers/authController.js";
import Auth from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/register",registerUser);
router.post("/verify-otp",verifyOtp);
router.get("/resend-otp",resendOtp);

router.post("/login",loginUser);
router.get("/protect",Auth,(req,res)=>{
    res.send("protected");
})


export default router;