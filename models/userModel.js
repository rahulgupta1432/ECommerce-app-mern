import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        // required:true
    },
    role:{
        type:Number,
        default:0
    },
    tokenVersion:{
        type:Number,
        default:0
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    // isDeleted:{
    //     type:Boolean,
    //     default:false
    // }
},{
    timestamps:true
});

// make pre middleware for hashed pwd
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    const salt=await bcrypt.genSalt(10)
    this.password=await bcrypt.hash(this.password,salt)
})

const User=mongoose.model("User",userSchema)

export default User