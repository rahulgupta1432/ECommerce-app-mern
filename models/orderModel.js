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
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    paymentMode:{
        type:String
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