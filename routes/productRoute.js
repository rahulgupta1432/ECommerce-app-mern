import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { createProduct, deleteProductById, getAllProducts, getProduct, updateProduct } from "../controllers/productController.js";
import { upload } from "../utils/uploadFile.js";

const router=express.Router();

router.post('/create-product', upload?.array('imageList'),createProduct);
router.put('/update-product', upload?.array('imageList'), updateProduct);
router.get('/get-product',getProduct);
router.get("/all-products",getAllProducts);
router.put("/delete-product",deleteProductById);


export default router;