import { CartModel } from "../../database/cartModel";
import express from "express";
import mongoose from "mongoose";

// import jwt from "jwttoekn"
import passport from "passport";
const Router = express.Router();

//add to cart

Router.put("/Add/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const Details = req.body.productDetails;

    let cart = await CartModel.findOne({ user: id });
    if (!cart) {
      cart = new CartModel({ user: id });
    }
    // console.log("am cart " + cart);
    for (const item of Details) {
      const { details, quantity } = item;

      // check the product is exist or not
      const existingProduct = cart.productDetails.find((product) =>
        product.details.equals(details)
      );

      if (existingProduct) {
        existingProduct.quantity = quantity;
      } else {

        cart.productDetails.push({
          details: new mongoose.Types.ObjectId(details),
          quantity,
        });
      }
    }
    await cart.save();

    return res.status(200).json({ status: "success", cart: cart });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: error.message });
  }
}
);
// getCart by auth
Router.get(
  "/getCart",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { user } = req;
      // console.log(user._id);
      const getCart = await CartModel.findOne({ user: user._id });

      res.status(200).json({ status: "success", getCart });
    } catch (error) {
      res.status(500).json({ status: "failed", error: error.message });
    }
  }
);

// getCart by id
Router.get("/getCart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(user._id);
    const getCart = await CartModel.findOne({ user: id });

    return res.status(200).json({ status: "success", getCart });
  } catch (error) {
    return res.status(500).json({ status: "failed", error: error.message });
  }
}
);

// delete product from cart
Router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    // console.log( "product "+productId);
    const cart = await CartModel.findOneAndUpdate(
      { user: id },
      { $pull: { productDetails: { details: productId } } },
      { returnOriginal: false }
    );
    // console.log(cart);
    if (!cart) {
      return res.status(404).json({ status: "Not found", error: error.message })
    }
    res.status(200).json({ status: "success", cart })
    // await cart.findOne()
    // await CartModel.findOneAndDelete({})
  } catch (error) {
    return res.status(500).json({ status: "Failed", error: error.message })
  }
})
Router.delete("/deleteCart/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // console.log( "product "+productId);
    const cart = await CartModel.findByIdAndDelete(id);
    // console.log(cart);
    if (!cart) {
      return res.status(404).json({ status: "Not found", error: error.message })
    }
    res.status(200).json({ status: "success", cart })
    // await cart.findOne()
    // await CartModel.findOneAndDelete({})
  } catch (error) {
    return res.status(500).json({ status: "Failed", error: error.message })
  }
})
export default Router;
