import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import Orders from "../models/orderModel.js"

export const getAllOrders=async(req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    let limit;
    const skip=(page-1)*limit;
    const type=req.query.type;
    const {userId}=req.query;

    try{
        let getOrders=[]
        if (type === 'Admin') {
            limit = parseInt(req.query.limit) || 10; 
        } else {
            limit = 50; 
        }

        getOrders = await Orders.find()
            .populate({
                path: "product"
            }).populate({
                path:'buyer',
                select:'-password -isAdmin',
                match:userId?{_id:userId}:undefined
            })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 })
            .exec();

        if(!getOrders||getOrders.length===0){
            sendResponse({
                res,
                message:"No Orders Found",
                data:[]
            })
        }
        const totalOrders = await Orders.countDocuments({ isDeleted: false });
        const pagination = {
            limit,
            page,
            pages: Math.ceil(totalOrders / limit),
            nextPage: page < Math.ceil(totalOrders / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalOrders / limit)
        };

            getOrders.push(pagination)

        sendResponse({
            res,
            message:"All Orders are Fetched successfully",
            data:getOrders
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}



export const getOrderById=async(req,res,next)=>{    
    try{
        const {orderId}=req.query;
        const getOrders = await Orders.findById(orderId)
            .populate({
                path: "product"
            })
            .sort({ createdAt: -1 })
            .exec();

        if(!getOrders||getOrders.length===0){
            sendResponse({
                res,
                message:"No Orders Found",
                data:[]
            })
        }
        sendResponse({
            res,
            message:"All Orders are Fetched successfully",
            data:getOrders
        })
        
    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}


export const updateOrderStatus=async(req,res,next)=>{
    try{
        const {orderId,status}=req.body;
        if(!orderId||!status){
            return next(new ErrorHandler("Please Provide Order Id and Status",400));
        }
        const order=await Orders.findByIdAndUpdate(orderId,{
            status
        });
        if(!order){
            return next(new ErrorHandler("Order Not Found",404));
        }
        sendResponse({
            res,
            message:"Order Updated Successfully",
            data:order
        })

    }catch(error){
        return next(new ErrorHandler(error.message,500));
    }
}




