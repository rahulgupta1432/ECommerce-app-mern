import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { getAllOrders, getOrderById } from "../controllers/adminController.js";


const router=express.Router();

router.get('/get-orders',getAllOrders);

router.get('/get/product-order',getOrderById);



export default router;