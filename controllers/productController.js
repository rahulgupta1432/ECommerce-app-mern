import slugify from "slugify";
import { addProductValidation } from "../helper/validation.js";
import Categories from "../models/categoriesModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import { uploadFile } from "../utils/uploadFile.js";
import mongoose from "mongoose";
import wishListModel from "../models/wishListModel.js";
import User from "../models/userModel.js";


export const createProduct = async (req, res, next) => {
        try {
            const { name, price, description, category, quantity } = req.body;
            const validate = await addProductValidation(req.body);
            if (!validate || (validate && validate.error)) {
                return next(new ErrorHandler(validate.error, 400));
            }

            const checkCategory = await Categories.findById(category);
            if (!checkCategory) {
                return next(new ErrorHandler("Category Not Found", 400));
            }

            const checkExistProduct = await Product.findOne({ name });
            if (checkExistProduct) {
                return next(new ErrorHandler("Product Already Exists", 400));
            }

            const productImageUrl=await req.files?.map((data)=>{
                return data.path;
            })

            const product = await Product.create({
                name,
                slug:slugify(name),
                price,
                description,
                category,
                imageList: productImageUrl,
                quantity
            });

            if (!product) {
                return next(new ErrorHandler("Product Not Created", 400));
            }

            sendResponse({
                res,
                message: "Product Created Successfully",
                data: product
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
};



export const updateProduct=async(req,res,next)=>{
    try{
        const {productId}=req.query;
        let {name,price,description,category,quantity,indices = [0] }=req.body;
        

        const checkProduct=await Product.findById(productId);
        if(!checkProduct){
            return next(new ErrorHandler("Product Not Found",404));
        }
        
        const productImagePaths = req.files ? await Promise.all(req.files.map(async (file) => {
            return file.path;
        })) : [];

        if(typeof indices==='string'){
            indices=JSON.parse(indices);
        }
        

        const updatedImages = [...checkProduct.imageList]; // Get the current image list

    
        if (Array.isArray(indices)) {
            console.log("Indices to Update:", indices);
            indices.forEach((index, i) => {
                console.log(`Checking Index: ${index}`);
                console.log(`Is Index Valid?`, index >= 0 && index < updatedImages.length);
                console.log(`Is New Image Path Valid?`, productImagePaths[i]);

                if (index >= 0 && index < updatedImages.length && productImagePaths[i]) {
                    updatedImages[index] = productImagePaths[i]; // Replace the image
                    console.log(`Updated Index ${index}: ${updatedImages[index]}`);
                } else {
                    console.log(`Skipping Index: ${index} (Out of range or missing new image)`);
                }
            });
        }

        
        let product=await Product.findByIdAndUpdate(productId,{
            name,
            slug:slugify(name),
            price,
            description,
            category,
            quantity,
            imageList:updatedImages
        },{new:true});
        if(!product){
            return next(new ErrorHandler("Product Not Updated",400));
        }
        product = { ...product.toObject(), ...req.body };

        sendResponse({
            res,
            message:"Product Updated Successfully",
            data:product
        })

    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}



export const getProduct=async(req,res,next)=>{
    try {
        const {productId}=req.query;
        const product=await Product.findById(productId).populate({
            path:'category'
        })
        if(!product){
            return next(new ErrorHandler("ProductNot Found",404));
        }
        sendResponse({
            res,
            message:"Product Fetched successfully",
            data:product
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}

export const getAllProducts=async(req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    let limit;
    const skip=(page-1)*limit;
    const type=req.query.type;
    const {userId}=req.query;
    console.log(userId);

    try{
        let getProducts=[]
        if (type === 'Admin') {
            limit = parseInt(req.query.limit) || 10; // Default limit for Admin
        } else {
            limit = 50; // Default limit for non-Admin or missing type
        }

        getProducts = await Product.find({ isDeleted: false })
            .populate({
                path: "category",
                select: "name"
            })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();

        if(!getProducts||getProducts.length===0){
            sendResponse({
                res,
                message:"No Products Found",
                data:[]
            })
        }
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const pagination = {
            limit,
            page,
            pages: Math.ceil(totalProducts / limit),
            nextPage: page < Math.ceil(totalProducts / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalProducts / limit)
        };

        const data=await Promise.all(
            getProducts?.map(async(product)=>{
                const wishList=await wishListModel.findOne({user:userId});
                        const isWishListed = wishList && wishList.product.includes(product._id);
                        return {
                            ...product?.toObject(),
                            isWishListed:isWishListed?true:false
                        }
                    })
                )
                
                // getProducts.push(pagination);
                data.push(pagination)

        sendResponse({
            res,
            message:"All Products are Fetched successfully",
            data:data
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}


export const deleteProductById=async(req,res,next)=>{
    try{
        const {productId}=req.query;
        const product=await Product.findByIdAndUpdate(productId,{
            isDeleted:true
        })
        if(!product){
            return next(new ErrorHandler("Product Not Found",400));
        }
        sendResponse({
            res,
            message:"Product Deleted successfully",
            data:[{ProductDeleted:product.isDeleted}]
        })
    }catch(error){
    return next(new ErrorHandler(error.message,500));
    }
}




export const productFilters=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit)||50;
        const skip=(page-1)*limit;
        const {checked,radioMin,radioMax,search,userId}=req.body;
        
        let args = {};       
        if (checked && Array.isArray(checked) && checked.length > 0) {
            const categoryIds = checked.map(id => new mongoose.Types.ObjectId(id));
            args.category = { $in: categoryIds }; // Use $in for multiple categories
        }
        if (radioMin !== undefined && radioMax !== undefined) {
            args.price = { $gte: parseFloat(radioMin), $lte: parseFloat(radioMax) };
        }
        if(search){
            args.name = { $regex: search, $options: 'i' };
        }

        let filterProducts;
        filterProducts = await Product.find({
            isDeleted: false,
            ...args
        }).limit(limit).skip(skip).sort({createdAt:-1})
        .populate({
            path: 'category',
            select: 'name'
        });
        console.log(args);

        const totalProducts=await Product.countDocuments({
            isDeleted:false,
            ...args
        });
        const pagination={
            limit,
            page,
            pages:Math.ceil(totalProducts/limit),
            nextPage:page<Math.ceil(totalProducts/limit)?page+1:null,
            prevPage:page>1?page-1:null,
            hasPrevPage:page>1,
            hasNextPage:page<Math.ceil(totalProducts/limit)
        }
        const data=await Promise.all(filterProducts?.map(async(product)=>{
            const checkWishlist=await wishListModel.findOne({user:userId});
            const isWishListed=checkWishlist&&checkWishlist.product.includes(product._id)?true:false
            return {
                ...product.toObject(),
                isWishListed:isWishListed?true:false
            }
        }))

        filterProducts.push(pagination);


        if(!filterProducts||filterProducts.length===0){
            sendResponse({
                res,
                message:"No Filter Data Found",
                data:[]
            })
        }

        sendResponse({
            res,
            message:"Filter Data Fetched successfully",
            data:data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}




// wishlist
export const toggleWishlist=async(req,res,next)=>{
    try {
        const {productId,userId}=req.query;
        if(!productId||!userId){
            return next(new ErrorHandler("Please Provide Product Id and User Id",400));
        }
        const checkUser=await User.findById(userId);
        if(!checkUser){
            return next(new ErrorHandler("User Not Found",400));    
        }
        const product=await Product.findById(productId);
        if(!product){
            return next(new ErrorHandler("Product Not Found",400));
        }
        let message;
        const checkProductInWishlist=await wishListModel.findOne({user:userId});
        if(!checkProductInWishlist){
            const createWishlist=await wishListModel.create({
                user:userId,
                product:productId,
                isActive:true
            })
            message="Wishlist item added successfully"
        }else{
            const productIndex=checkProductInWishlist.product.indexOf(productId);
            if(productIndex===-1){
                checkProductInWishlist.product.push(productId);
                message = "Wishlist item added successfully.";
            }else{
                // checkProductInWishlist.product.splice(productIndex, 1);
                checkProductInWishlist.product.pull(productId);
                message = "Wishlist item removed successfully.";

            }
            await checkProductInWishlist.save();
        }
        sendResponse({
            res,
            message:message,
            data:checkProductInWishlist
        })
    } catch (error) {
        console.log(error)
        return next(new ErrorHandler(error.message,500));
    }
}


export const searchAllProducts=async(req,res,next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        let limit=parseInt(req.query.limit)||50;
        const skip=(page-1)*limit;
        const {search,userId}=req.query;
        const regex=new RegExp(search,'i');
        let products = await Product.find({
            isDeleted: false,
            $or: [
                { name: regex },
                { description: regex }
            ]
        }).limit(limit).skip(skip).sort({ createdAt: -1 }).populate({
            path: 'category',
            select: 'name'
        })
        .exec();
        const totalProducts=await Product.countDocuments({
            isDeleted:false,
            $or: [
                { name: regex },
                { description: regex }
            ]
        });
        if(!products||products.length===0){
            sendResponse({
                res,
                message:"No Products Found",
                data:[]
            })
        }

        const pagination={
            limit,
            page,
            pages:Math.ceil(totalProducts/limit),
            nextPage:page<Math.ceil(totalProducts/limit)?page+1:null,
            prevPage:page>1?page-1:null,
            hasPrevPage:page>1,
            hasNextPage:page<Math.ceil(totalProducts/limit)
        }
        const data=await Promise.all(products?.map(async(product)=>{
            const checkWishlist=await wishListModel.findOne({user:userId});
            const isWishListed=checkWishlist&&checkWishlist.product.includes(product._id)?true:false
            return {
                ...product.toObject(),
                isWishListed:isWishListed?true:false
            }
        }))

        products.push(pagination);

        sendResponse({
            res,
            message:"All Products Fetched successfully",
            data:data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
}
}