import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { createProduct, deleteProductById, getAllProducts, getProduct, productFilters, searchAllProducts, toggleWishlist, updateProduct } from "../controllers/productController.js";
import { upload } from "../utils/uploadFile.js";
import searchQueryOnSingleField from "../middleware/utilify.js"

const router=express.Router();

router.post('/add-product', upload?.array('imageList'),createProduct);
router.put('/update-product', upload?.array('imageList'), updateProduct);
router.get('/get-product',getProduct);
router.get('/all-products',getAllProducts);
router.delete('/delete-product',deleteProductById);

router.post('/product-filters',productFilters);


router.get('/toggle-product-wishlist',toggleWishlist);

router.get('/search-product',searchAllProducts);

export default router;