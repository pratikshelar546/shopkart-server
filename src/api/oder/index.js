import mongoose from "mongoose";
import express from "express";
import { orderModel } from "../../database/orderModel";

import sendEmail from "../../config/sendEmail";
import passport from "passport";
import { productModel } from "../../database/productModel";

const Router = express.Router();

Router.post(
    "/orderDetails", async (req, res) => {
        try {
            const { shippingInfo, orderItems, paymentInfo, totalCartPrice, orderStatus, user } = req.body;
            // console.log("data revived",orderItems[0].product);
            // console.log(shippingInfo.phoneNo);
            // console.log("am from add order", shippingInfo, orderItems);
            const paidAt = Date.now();
            let order = await orderModel.findOne({ "user._id": user._id });
            // console.log(order);
            if (!order) {
                order = await orderModel.create({
                    shippingInfo,
                    orderItems,
                    paymentInfo,
                    totalCartPrice,
                    orderStatus,
                    user,
                    paidAt,
                });
            } else {
                for (const items of orderItems) {
                    order.orderItems.push(items);
                }
                await order.save();
            }
            for (const item of orderItems) {
              
                const product = await productModel.findById(item.product);
                // console.log(product);
                if (!product) {
                    return res.status(404).json({ status: "failed", message: "product not found" })
                }
                if(product.quantity < item.quantity){
                    return res.status(400).json({ status: "failed", message: "Insufficient quantity" });
                }
                product.quantity -= item.quantity;
                await product.save();
            }
            await sendEmail({
                email: user.email,
                templateId: 'd-935fb403c94b4457bc97e360e598b769',
                data: {
                    name: user.fullName,
                    shippingInfo,
                    orderItems,
                    paymentInfo,
                    totalCartPrice,
                    oId: order._id
                },
            });
            // console.log("logging new orders", order);
            res.status(200).json({ status: "Success", details: order });
        } catch (error) {
            res.status(500).json({ status: "failed", message: error.message });
        }
        // console.log(shippingInfo,orderItems,paymentInfo,totalPrice,orderStatus);
    }
);
// get order details by user id
Router.get('/getOrderDetails/:id', async (req, res) => {
    const userId = req.params.id;
    // console.log(userId);
    try {
        const orderDetails = await orderModel.findOne({ "user._id": userId });
        // console.log(orderDetails);
        if (!orderDetails) {
            return res.status(404).json({ status: "failed", message: "please order product first" })
        }
        return res.status(200).json({ status: "success", orderDetails })
        // console.log(orderDetails);
    } catch (error) {
        return res.status(500).json({ status: "failed", error: error.message })
    }
})

// get order product --admin\

Router.get("/getOrderdProduct/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // console.log("am from getorder", id);
        // console.log(id);
        const products = await productModel.find({ admin: id });
        // console.log(products[0]._id);
        if (products.length === 0) {
            // console.log("No products found for this admin.");
            return res.status(404).json({ message: "no product found for this admin" })
        } else {

            const orders = await orderModel
                .find({ 'orderItems.product': { $in: products.map(product => product._id) } }).populate({
                    path: 'orderItems.product', // Specify the correct path
                });
            // console.log("from orser", orders[0]);

            // console.log(orders[0]);
            let productFound = [];
            const orderdProductDetails = orders.map(order => ({

                orderItems: order.orderItems,
                shippingInfo: order.shippingInfo,
            }));
            // console.log("pfrom", orderdProductDetails);
            for (const item of orderdProductDetails) {
                for (let i = 0; i < item.orderItems.length; i++) {
                    const productAdminId = item?.orderItems[i].product.admin;
                    if (productAdminId && productAdminId.toString() === id) {
                        // console.log(item?.orderItems[i]);
                        // console.log("item found", item);
                        productFound.push({ shippingInfo: item.shippingInfo, orderItems: item.orderItems[i] });
                        // break; // Exit the loop once an item is found
                    }
                }
            }
            // console.log(productFound);
            // console.log("done");
            return res.json(productFound)

        }
        //   return res.status(201).json({ products })
    } catch (error) {
        return res.status(500).json({ status: "Failed", error: error.message });

    }
})

// get orderDetails based on orderItems
Router.get('/detDetailsByProductId/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await orderModel.findOne({ 'orderItems._id': id });
        const matchItem = product.orderItems.find(item => item._id.toString() === id)
        // console.log(product);
        const responseProduct = {
            ...product.toObject(),
            orderItems: [matchItem]
        }
        // console.log(responseProduct);
        return res.status(200).json({ status: "success", responseProduct })
    } catch (error) {
        return res.status(500).json({ status: "Failed", error: error.message })
    }
})
Router.put('/updateStatus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orderStatus = req.body.orderStatus;

        const updatedOrder = await orderModel.findOneAndUpdate({ 'orderItems._id': id }, { $set: { 'orderItems.$.orderStatus': orderStatus } }, { new: true })
        // console.log(updatedOrder);
        if (!updatedOrder) {
            return res.json(404).json({ message: "something went wrong" })
        }
        return res.status(200).json({ message: "updated successfully" })
    } catch (error) {
        return res.status(500).json({ status: "Failed", error: error.message })

    }
})

export default Router;
