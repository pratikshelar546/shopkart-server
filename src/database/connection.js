// const mongoose = require("mongoose");
import mongoose from "mongoose";

export default async ()=>{
    
    return mongoose.connect(process.env.MongoDb);
}