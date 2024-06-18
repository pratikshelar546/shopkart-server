import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const ownerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    }

}, { timestamps: true }
)
ownerSchema.methods.genrateJwtToken = function () {
    return jwt.sign({ admin: this._id.toString() }, "flipcartOwner", { expiresIn: "10d" });


}
ownerSchema.statics.findByEmail = async ({ email }) => {
    const admin = await OwnerModel.findOne({ email });
    if (admin) { throw new Error("Admin already exist please login"); }
    return false
}
ownerSchema.statics.FindByEmailAndPass = async ({ email, password }) => {
    const admin = await OwnerModel.findOne({ email });
    if (!admin) throw new Error("admin not exist");

    const checkPassword = await bcrypt.compare(password, admin.password);
    if (!checkPassword) {
        throw new Error("invalid credentials");
    }
    return admin;
};

ownerSchema.pre("save", function (next) {
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
export const OwnerModel = mongoose.model('Owner', ownerSchema);