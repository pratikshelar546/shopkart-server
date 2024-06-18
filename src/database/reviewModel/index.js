import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
    review: {
      type: String,
    },
      rating: {
      type: Number,
      default: 1
    },

  },
  { timestamps: true }
);
export const reviewModel = mongoose.model("Review", reviewSchema);

