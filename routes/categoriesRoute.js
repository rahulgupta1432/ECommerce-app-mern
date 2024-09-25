import express from "express";
import Auth, { Admin } from "../middleware/authMiddleware.js";
import { CreateCategories, deleteCategoriesById, getAllCategories, getCategories, updateCategories } from "../controllers/categoriesController.js";
import searchQueryOnSingleField from "../middleware/utilify.js"
import { upload } from "../utils/uploadFile.js";
const router=express.Router();


router.post("/add-category",upload.single('image'),CreateCategories);//Auth,Admin,

router.put("/update-category",updateCategories);

router.get("/get-category",getCategories);

router.get("/all-category", searchQueryOnSingleField(['name', 'slug']), getAllCategories);

router.put("/delete-category",deleteCategoriesById);


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