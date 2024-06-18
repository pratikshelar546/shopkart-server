import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admins",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        isOffer: {
            type: Boolean
        },
        offerPrice: {
            type: Number
        },
        description: {
            type: String,
            // required: true
        },
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        specification: [
            {
                title: String,
                description: String,
            }
        ],
        key: {
            type: String,
            required: true
        },
        Highlights: {
            type: Array,
            // required:true
        },
        service: {
            type: Array
        },
        image: {
            type: Array
        },
        brand: {
            Name: {
                type: String,
                required: true
            },
            logo: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            }
        },

        reviews: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                rating: {
                    type: Number,
                    required: true
                },
                comment: {
                    type: String,
                    required: true
                }
            }
        ],
    }, { timestamps: true }
)
export const productModel = mongoose.model("Product", productSchema);