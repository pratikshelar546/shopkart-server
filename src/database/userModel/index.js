import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            requried: true
        },
        email: {
            type: String,
            requried: true
        },
        phoneNumber: {
            type: Number,
            requried: true,

        },
        password: {
            type: String,
            required: true,
        },
        resetPasswordToken: String,
        resetPasswordExipre: String
    },
    { timestamps: true }
);

UserSchema.methods.genrateJwtToken = function () {
    return jwt.sign({ user: this._id.toString() }, "flipcart", { expiresIn: "10d" });
}

UserSchema.methods.getResetToken = function () {
    // console.log("hitt");
    const resetToken = crypto.randomBytes(15).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // console.log(this.resetPasswordToken);
    this.resetPasswordExipre = Date.now() + 10 * 60 * 1000;
    return resetToken;
}
// console.log(getResetToken);
UserSchema.statics.findByEmail = async ({ email }) => {
    const checkByEmail = await UserModel.findOne({ email });
    if (checkByEmail) {
        throw new Error("User already exist...")
    }
    return false;
};
UserSchema.methods.matchPassword = function (oldPassword,callback) {
bcrypt.compare(oldPassword,this.password,(error, isMatch)=>{
    if(error) callback(error);
    callback(null, isMatch);
})
   }

UserSchema.statics.FindByEmailAndPass = async ({ email, password }) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("user not exist");

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
        throw new Error("invalid credentials");
    }
    return user;
};

UserSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();


    bcrypt.genSalt(8, (error, salt) => {
        if (error) return next(error);

        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) return next(error);

            user.password = hash;
            return next();
        })
    })
})
export const UserModel = mongoose.model("users", UserSchema);
