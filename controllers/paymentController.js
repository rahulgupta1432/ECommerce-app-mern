import braintree from "braintree";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendResponse from "../utils/sendResponse.js";
import Order from "../models/orderModel.js";
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANTID_PAYMENT,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY_PAYMENT,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY_PAYMENT
  });
  


export const getPaymentGatewayToken=async(req,res,next)=>{
    try {
        gateway.clientToken.generate({},function(err,result){
            if(err){
                return next(new ErrorHandler(err.message,500));
            }
            sendResponse({
                res,
                message:"Token Generated successfully",
                data:result
            })
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}


export const paymentForOrder=async(req,res,next)=>{
    try {
        console.log("aaya")
        const {cart,nonce}=req.body;
        let total=0;
        // cart.map(i=>total+=i.price);
        cart.map((i)=>{
            total+=i.price;
        })
        console.log("query",req.query,"end");
        console.log("body",req.body,"end");
        let order;
        let newTransaction=gateway.transaction.sale({
            amount:total,
            paymentMethodNonce: nonce[0],
            options:{
                submitForSettlement: true,
            }
        },
        function(error,resp){
            if(error){
                return next(new ErrorHandler(error.message,500));
            }
            if(resp){
                order=new Order({
                    product:cart,
                    payment:resp,
                    buyer:req.user._id,
                    status:"Processing"
                }).save();
                sendResponse({
                    res,
                    message:"Payment Successfull",
                    data:order
                })
            }
        }
    )
    console.log("newTransaction",newTransaction,"end")
    console.log("order",order,"end")
    } catch (error) {
        console.log(error)
        return next(new ErrorHandler(error.message,500));
    }
}