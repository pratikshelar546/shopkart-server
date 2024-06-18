import { UserModel } from "../../database/userModel";
import express from "express";
import passport from "passport";
import sendEmail from "../../config/sendEmail";
import crypto from "crypto"
const Router = express.Router();

Router.post("/signup", async (req, res) => {
  try {
    await UserModel.findByEmail(req.body.credentials);
    const newUser = await UserModel.create(req.body.credentials);
    const token = newUser.genrateJwtToken();
    return res.status(200).json({ status: "success", token })

  } catch (error) {
    return res.status(500).json({ status: "failed", error: error.message });
  }
})

Router.post("/signin", async (req, res) => {
  try {
    const user = await UserModel.FindByEmailAndPass(req.body.credentials);
    //  console.log(user);
    const token = await user.genrateJwtToken();
    return res.status(200).json({ status: "success", token })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })
  }
});

Router.get("/getUser", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { fullName, email, _id } = req.user;
    // console.log(req.user._id);
    return res.status(201).json({ user: { fullName, email, _id } })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })
  }
})

Router.post("/forgetPassword", async (req, res) => {
  try {
    const email = req.body.email;

    const user = await UserModel.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ status: "failed", message: "user not found" });
    }
    const resetToken = await user.getResetToken();
    await user.save();
    const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
    // const message = `Click on the link to reset your password ${url}. If you have not requent the please igonre`
    await sendEmail({
      email: user.email,
      templateId:'d-85b2aa07f906461993b8ca588c80bce1',
      data: {
        url
      }
    })
    return res.status(200).json({ status: "success", message: `Reset password link is share to email ${user.email}` })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })

  }
})
Router.put("/resetPassword/:token", async (req, res) => {
  try {
    const { token } = req.params;


    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExipre: {
        $gt: Date.now()
      }
    })

    if (!user) {
      return res.status(400).json({ status: "failed", message: "user not found" })
    }

    user.password = req.body.password;
    user.resetPasswordExipre = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    return res.status(200).json({ status: "success", message: "Password updated successfully" })
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })

  }
})

Router.put('/chnagePassword', async (req, res) => {
  try {
    const { oldPassword, newPassowrd, confirmPassword, email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) (
      res.status(400).json({ status: "failed", message: "user not found" })
    )

    await user.matchPassword(oldPassword, (error, isMatch) => {
      if (error) {
        return res.status(400).json({ status: "failed", message: "Something went wrong please refresh the page or try later" })
      } if (isMatch) {
        if (newPassowrd === confirmPassword) {
          user.password = confirmPassword;
          user.save();
          return res.status(200).json({ status: "success", message: "Password changed successfully" })
        } else {
          return res.status(404).json({ status: "not matched", message: "Pelase enter the same password that  can matched" })
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message })

  }
})
export default Router;