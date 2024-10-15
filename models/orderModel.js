import mongoose, { mongo } from "mongoose";

const orderSchema=new mongoose.Schema({
    product:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    }],
    quantity:{
        type:String,
        default:1
    },
    totalPayment:{
        type:String,
        required:true
    },
    payment:{
    },
    orderId:{
        type:String,
    },
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    paymentMode:{
        type:String,
        enum: ['Paypal', 'COD'], // Allowed payment modes
        required: true
    },
    status:{
        type:String,
        default:'Placed',
        enum:["Placed","Shipped","Delivered","Cancelled"]
    }
},{
    timestamps:true
});

const Order=mongoose.model('order',orderSchema);

export default Order;