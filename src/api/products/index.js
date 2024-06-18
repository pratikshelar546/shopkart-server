import { productModel } from "../../database/productModel";
const multer = require("multer");
import path from "path";
import express from "express";
const Router = express.Router();
const fs = require("fs");
import { v2 as cloudinary } from "cloudinary";
import { AsyncLocalStorage } from "async_hooks";
import { log } from "console";
import { request } from "http";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true);
  }
  cb(null, false);
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },

});
Router.post("/addProduct",upload.fields([{ name: "image", maxCount: 10 }, { name: "logo", maxCount: 2 }]), async (req, res, next) => {
  try {

    const imageUrl = [];

    const uploadPromises = [];

    //  console.log(req.files.image);
    for (var i = 0; i < req.body.image?.length; i++) {
      const filePath = req.body.image[i];
      const uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { folder: 'products' }, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url
            });
          }
        });
      });

      uploadPromises.push(uploadPromise);
    }
    let specs = [];
    req.body.specification.forEach((s) => {
      // console.log(s),
      specs.push(s)
    });
    req.body.specification = specs;
    // console.log(req.files.logo.path)
    const filepath = req.body.brand.logo;

    // console.log(filepath);
    const result = await cloudinary.uploader.upload(filepath, {
      folder: "brands"
    });
    // console.log(result);
    const brandLogo = {
      public_id: result.public_id,
      url: result.secure_url
    }
    req.body.brand = {
      Name: req.body.brand.Name,
      logo: brandLogo
    }
    // console.log(req.body.brand);

      console.log("photo");

      (async () => {
        try {
          const results = await Promise.all(uploadPromises);
          imageUrl.push(...results);
          req.body.image = imageUrl;

          // console.log(req.body);

          const newProduct = await productModel.create(req.body)

          return res.status(201).json({ status: "product added", newProduct });
          // Handle the newProduct as needed

        } catch (error) {
          return res.status(500).json({ status: "Failed", error: error.message });

        }
      })();


  }
  catch (error) {
    return res.status(500).json({ message: error.message, status: "failed" });
  }
});

// update product
Router.put("/updateProduct/:id", upload.fields([{ name: "image", maxCount: 10 }, { name: "logo", maxCount: 2 }]), async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log("find");
    // console.log(req.body.highlights);

    const product = await productModel.findOne({ _id: id });
    if (!product) {
      return res.json(404).json({ status: "Product Not found" });
    }
    // console.log(product);
    if (req.body.image !== undefined) {
      let imageUrl = [];
      if (typeof req.body.image === "string") {
        // console.log("am");
        imageUrl.push(req.body.image);
      } else {
        // console.log("you");
        imageUrl = req.body.image;
      }

      const uploadPromises = [];

      for (let i = 0; i < imageUrl.length; i++) {

        // console.log("url",product.image[i].url);
        try {
          if (imageUrl[i] === product.image[i]?.url) {
            // console.log("same");
            uploadPromises.push(product.image[i]);
          } else {
            // console.log(imageUrl[i]);
            const result = await cloudinary.uploader.upload(imageUrl[i], {
              folder: "products",
            });
            // console.log(result);
            // console.log("Image uploaded successfully ", i + 1);
            // console.log(uploadPromises);
            uploadPromises.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }

        } catch (error) {
          // Handle the error for this specific image upload
          console.error(`Error uploading image ${i + 1}:`, error.message);

        }
      }
      // console.log(uploadPromises);
      req.body.image = uploadPromises;
      let specs = [];
      req.body.specification.forEach((s) => {
        specs.push(s)
      });
      req.body.specification = specs;

      if (req.body.brand.logo.length > 0) {
        // await cloudinary.uploader.destroy(product.brand.logo.public_id);
        // console.log(req.body.brand);
        if (product.brand.logo.url === req.body.brand.logo) {
          // console.log("same logo");
          const brandLogo = {
            public_id: product.brand.logo.public_id,
            url: product.brand.logo.url
          }
          req.body.brand = {
            Name: product.brand.Name,
            logo: brandLogo
          }
          // console.log("stored");
        } else {
          // console.log("newLogo");
          await cloudinary.uploader.destroy(product.brand.logo.public_id)
          const result = await cloudinary.uploader.upload(req.body.brand.logo, {
            folder: "brands"
          });
          const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url
          }
          req.body.brand = {
            Name: req.body.brand.Name,
            logo: brandLogo
          }
        }
      }


      const updateProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
      return res.status(200).json({ message: "successfully update", updateProduct })

      // (async () => {
      //   try {

      //     const results = await Promise.all(uploadPromises);
      //     imageUrl.push(...results);
      //     req.body.image = imageUrl;


      //     const updatedProduct = await productModel.findOneAndUpdate(
      //       { _id: id },
      //       req.body,
      //       { new: true })
      //     return res.status(201).json({ status: "product updated", updatedProduct });
      //     // Handle the newProduct as needed

      //   } catch (error) {
      //     return res.status(500).json({ status: "Failed", error: error.message });

      //   }
      // })();


    }
  }
  catch (error) {
    return res.status(500).json({ message: error.message, status: "failed" });
  }
});

Router.delete("/deleteProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.findOneAndRemove({ _id: id });
    return res.status(200).json({ status: "success", message: "product deleted successfully" })
  } catch (error) {
    return res.status(500).json({ status: "falied", error: error.message })
  }
})
// get all products

Router.get("/getProduct", async (req, res) => {
  try {
    const products = await productModel.find();
    return res.status(200).json({ status: "success", products });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error });
  }
});
Router.get("/getProdductByAdmin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await productModel.find({ admin: id });


    return res.status(200).json({ products })
  } catch (error) {
    return res.status(500).json({ status: "Failed", error: error.message });

  }
})
// get product by category
Router.get("/getProduct/:category", async (req, res) => {
  try {
    const { category } = req.params;
    // console.log(category);
    const product = await productModel.find({ category });
    if (product.length === 0) {
      return res.json({ error: "category not found" });
    }
    return res.status(200).json({ status: "success", product });
  } catch (error) {
    return res.status(500).json({ status: "failed", error: error.message });
  }
});

Router.get("/getProduct/search/:searchString", async (req, res) => {
  try {
    const { searchString } = req.params;
    const product = await productModel.find({
      title: new RegExp(searchString, "i"),
      description: new RegExp(searchString, "i")
    });

    if (product.length === 0) {
      return res.json({ error: "Product not found" });
    }
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



// get product by id
Router.get("/getProductById/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    // console.log(_id);
    const product = await productModel.findById(_id);
    if (!product) {
      res.json({ error: "product not found" });
    }
    // console.log(product);
    return res.status(200).json({ status: "success", product });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error });
  }
});

export default Router;
