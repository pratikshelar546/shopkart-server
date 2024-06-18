import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const adminSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        address:{
            type:String
        },
    }, { timestamps: true }
)
adminSchema.methods.genrateJwtToken = function () {
    return jwt.sign({ admin: this._id.toString() }, "flipcart", { expiresIn: "10d" });


}
adminSchema.statics.findByEmail = async ({ email }) => {
    const admin = await AdminModel.findOne({ email });
    if (admin) { throw new Error("Admin already exist please login"); }
    return false
}
adminSchema.statics.FindByEmailAndPass = async ({ email, password }) => {
    const admin = await AdminModel.findOne({ email });
    if (!admin) throw new Error("admin not exist");

    const checkPassword = await bcrypt.compare(password, admin.password);
    if (!checkPassword) {
        throw new Error("invalid credentials");
    }
    return admin;
};

adminSchema.pre("save", function (next) {
    const admin = this;
    if (!admin.isModified("password")) return next();


    bcrypt.genSalt(8, (error, salt) => {
        if (error) return next(error);

        bcrypt.hash(admin.password, salt, (error, hash) => {
            if (error) return next(error);

            admin.password = hash;
            return next();
        })
    })
})

export const AdminModel = mongoose.model("admins", adminSchema);