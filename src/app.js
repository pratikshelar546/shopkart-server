// import react from "react";
import dotenv from "dotenv";
import ConnectDB from "./database/connection.js"
import { v2 as cloudinary } from "cloudinary"
import express from "express";
import privateRouteConfig from "./config/routeConfig.js"
import session from "express-session";
import cors from "cors";
import passport from "passport";
import User from "./api/users";
import Product from "./api/products"
import Order from "./api/oder"
import Cart from "./api/carts"
import Admin from "./api/admin"
import Owner from "./api/owner"
import Review from "./api/review"
import bodyParser from "body-parser";
// import fileUpload from "express-fileupload";
dotenv.config();
const flipcart = express();

privateRouteConfig(passport);
// googleConfig(passport);
flipcart.use(express.json());
flipcart.use(session({ secret: "flipcart" }));
flipcart.use(passport.initialize());
flipcart.use(passport.session());
flipcart.get("/", (req, res) => res.send("Namaste"));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// flipcart.use(fileUpload({
//   useTempFiles:true 
// }))
flipcart.use(cors(corsOptions));

flipcart.use(bodyParser.json());
flipcart.use("/upload", express.static("upload"));
flipcart.use("/user", User);
flipcart.use("/product", Product);
flipcart.use("/owner", Owner)
flipcart.use("/cart", Cart);
flipcart.use("/review", Review);
flipcart.use("/order", Order);
flipcart.use("/admin",Admin);
// cloudinary
flipcart.use(bodyParser.json({ limit: '10mb' }));
flipcart.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const port = 8080;
flipcart.listen(port, () => {
  ConnectDB()
    .then(() => {
      console.log("server is running");
    })
    .catch((error) => {
      console.log("server is running but database connection failed");
      console.log(error);
    });
});
// console.log(`server is running is on port ${port}`));