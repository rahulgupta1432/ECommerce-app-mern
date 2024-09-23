import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import Categories from "../models/categoriesModel.js";
import slugify from "slugify";
export const CreateCategories=async(req,res,next)=>{
    try {
        const {name,image,parent_category_id}=req.body;
        if(!name){
            return next(new ErrorHandler("Name is Required",400))
        }
        const checkExistCategory=await Categories.findOne({
            name
        });
        if(checkExistCategory){
            return next(new ErrorHandler("Category Already Exist",400))
        }
        const categories=await Categories.create({
            name,
            slug:slugify(name),
            image,
            parent_category_id
        });
        if(!categories){
            return next(new ErrorHandler("Categories Not Created",400))
        }
        sendResponse({
            res,
            message:"New Categories Added successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
    }
}

export const updateCategories=async(req,res,next)=>{
    try {
        const {categoryId,name,image,parent_category_id}=req.body;
        if(!categoryId){
            return next(new ErrorHandler("Category Id is Required",400))
        }
        const checkExistCategory=await Categories.findById(categoryId);
        if(!checkExistCategory){
            return next(new ErrorHandler("Category Not Found",404))
        }
        const categories=await Categories.findByIdAndUpdate(categoryId,{
            name,
            slug:slugify(name),
            image,
            parent_category_id
        },{new:true});
        if(!categories){
            return next(new ErrorHandler("Categories Not Updated",400))
        }
        sendResponse({
            res,
            message:"Categories Updated successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}


export const getCategories=async(req,res,next)=>{
    try {
        const {categoryId}=req.query;
        const categories=await Categories.findById(categoryId);
        if(!categories){
            return next(new ErrorHandler("Categories Not Found",404));
        }
        sendResponse({
            res,
            message:"Categories Fetched successfully",
            data:categories
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

export const getAllCategories=async(req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip=(page-1)*limit;
    try{
        let getCategories=[]
        getCategories=await Categories.find({isDeleted:false}).limit(limit).skip(skip).sort({createdAt:-1}).exec();   
        if(!getCategories||getCategories.length===0){
            sendResponse({
                res,
                message:"No Categories Found",
                data:[]
            })
        }
        const pagination={};
        pagination.limit = limit;
        pagination.page = page;
        pagination.pages = Math.ceil(getCategories / limit);
        pagination.nextPage = parseInt(page) < pagination.pages ? parseInt(page) + 1 : null;
        pagination.prevPage = page > 1 ? parseInt(page) - 1 : null;
        pagination.hasPrevPage = page > 1;
        pagination.hasNextPage = page < pagination.pages;
        getCategories.push(pagination)
        sendResponse({
            res,
            message:"All Categories are Fetched successfully",
            data:getCategories
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}



export const deleteCategoriesById=async(req,res,next)=>{
    try{
        const {categoryId}=req.query;
        const categories=await Categories.findByIdAndUpdate(categoryId,{
            isDeleted:true
        })
        if(!categories){
            return next(new ErrorHandler("Categories Not Found",400));
        }
        sendResponse({
            res,
            message:"Categories Deleted successfully",
            data:[{CategoryDeleted:categories.isDeleted}]
        })
    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}