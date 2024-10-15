import mongoose from "mongoose";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import fs from "fs/promises";
import path from "path";

const __dirname = path.resolve();

// jeans all done
// shirt 0 to 23 done
// LenghaCholi No bcoz image is not working
// women dress all 40
// women jeans all 40
// women top all 40
// women saree all
// women lengha choli all 15
// men pant 40
//wo dress 37

export const AddProductwithJsonFile=async(req,res,next)=>{
    try{
        console.log("dir",__dirname);
        // const filePath = path.join(__dirname, 'helper/men_jeans.json');
        // const filePath = path.join(__dirname, 'seeder/men_shirt.json');
        // const filePath = path.join(__dirname, 'seeder/women_dress.json');
        // const filePath = path.join(__dirname, 'seeder/women_jeans.json');
        // const filePath = path.join(__dirname, 'seeder/women_top.json');
        // const filePath = path.join(__dirname, 'seeder/saree.json');
        const filePath = path.join(__dirname, 'seeder/wo-dress.json');
        console.log("filePath",filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        const products = JSON.parse(data);
        // const limitedProducts = products.slice(0,23); 

        // return res.send(products);
        // const priceNumber = parseFloat(product.price.replace(/₹|,/g, ''));
        const productPromises = products.map(product => {
            const newProduct = new Product({
                name: product.title,
                slug: product.title.toLowerCase().replace(/ /g, '-'),
                price: product.price,
                description: product.description,
                // category: new mongoose.Types.ObjectId("670edfb922776033217d2ea2"),
                // category: new mongoose.Types.ObjectId("670ee4ba22776033217d2ea4"),
                // category: new mongoose.Types.ObjectId("670ee66b22776033217d2ea5"),
                // category: new mongoose.Types.ObjectId("670ee93b22776033217d2ea6"),
                // category: new mongoose.Types.ObjectId("670ee9cf22776033217d2ea7"),
                category: new mongoose.Types.ObjectId("670ef15b22776033217d2ead"),

                imageList: [product.imageUrl],
                quantity: product.quantity||150,
                isDeleted: false,
                isActive: true,
            });
            console.log("start new",newProduct,"end product")
            // console.log(product.quantity)
            return newProduct.save();
        });
        const alldata=await Promise.all(productPromises);
        // res.send("Products Added Successfully");
        return res.status(200).json({
            data:alldata
        })
    }catch(error){
        console.log('error',error)
        return next(new ErrorHandler(error.message,500));
    }
}