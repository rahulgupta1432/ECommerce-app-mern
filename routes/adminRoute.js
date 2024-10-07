import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { upload } from "../utils/uploadFile.js";
import { getProfileByUserId, updateProfileInfo } from "../controllers/adminController.js";


const router=express.Router();

router.get('/get-user',Auth,getProfileByUserId);
router.put('/update-profile',Auth, upload?.single('image'), updateProfileInfo);


export default router;