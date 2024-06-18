import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Types.ObjectId,
            ref:"users",
        },
        productDetails:[
            {
                details:{
                    type:mongoose.Types.ObjectId,
                    ref:"products",
                    required:true   
                },
                quantity:{
                    type:Number,
                    default:1
                }
           
            }
        ]
    },
    {timeStamps:true}
)
export const CartModel =mongoose.model("Carts" , cartSchema);