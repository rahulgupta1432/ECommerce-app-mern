import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import Auth from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/protect",Auth,(req,res)=>{
    res.send("protected");
})

export default router;