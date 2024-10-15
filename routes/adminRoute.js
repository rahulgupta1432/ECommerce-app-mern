import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { getAllOrders, getAllUsers, getOrderById, updateOrderStatus } from "../controllers/adminController.js";
import { AddProductwithJsonFile } from "../controllers/seederController.js";


const router=express.Router();

router.get('/get-orders',getAllOrders);

router.get('/get/product-order',getOrderById);

router.put('/update-status/order',updateOrderStatus);

router.get('/get-users',getAllUsers);

router.get('/add-data',AddProductwithJsonFile);


export default router;