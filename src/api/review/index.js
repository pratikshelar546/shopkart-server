import express from "express";
import { reviewModel } from "../../database/reviewModel";
import passport from "passport";

const Router = express.Router();

Router.post("/Add", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {

    const { user } = req;
    // console.log(user._id);
    const productId = req.body.id
    const { review, rating } = req.body;
    // console.log(review, rating);
    const newReview = await reviewModel.create({
      user: user._id,
      product: productId,
      review: review,
      rating: rating
    });
    return res.status(201).json({ status: "success", newReview })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message });
  }
});
Router.get("/getReviewByProduct/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await reviewModel.find({ product: id }).populate({ path: 'user', select: 'fullName email' });
    // console.log(reviews);
    return res.status(200).json({ status: "sucess", reviews: reviews })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })

  }


})

Router.delete("/remove", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = req;
    await reviewModel.findOneAndDelete({ user: user._id });
    return res.status(201).json({ status: "success", message: "Reivew is deleted" })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })
  }
})
Router.delete("/deleteReview/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await reviewModel.findByIdAndDelete(id);
    return res.status(201).json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })
  }
})
export default Router;