import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { getAllOrders } from "../controllers/adminController.js";


const router=express.Router();

router.get('/get-orders',getAllOrders);



export default router;