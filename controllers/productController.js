import slugify from "slugify";
import { addProductValidation } from "../helper/validation.js";
import Categories from "../models/categoriesModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import { uploadFile } from "../utils/uploadFile.js";


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
            console.log("error",error.message);
            return next(new ErrorHandler(error.message, 500));
        }
};



export const updateProduct=async(req,res,next)=>{
    try{
        // console.log("Incoming request body:", req.body);
        const {productId}=req.query;
        let {name,price,description,category,quantity,indices = [0] }=req.body;
        

        const checkProduct=await Product.findById(productId);
        if(!checkProduct){
            return next(new ErrorHandler("Product Not Found",404));
        }
        
        const productImagePaths = req.files ? await Promise.all(req.files.map(async (file) => {
            return file.path; // Assuming you're saving the file path directly
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

        getProducts.push(pagination);
        

        sendResponse({
            res,
            message:"All Products are Fetched successfully",
            data:getProducts
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