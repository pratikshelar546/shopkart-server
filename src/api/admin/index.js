import express from "express"
import { AdminModel } from "../../database/adminModel"
import passport from "passport";
const Router = express.Router();
Router.post("/Signup", async (req, res) => {
    try {

        await AdminModel.findByEmail(req.body.data);
        const newUser = await AdminModel.create(req.body.data);
        const token = newUser.genrateJwtToken();
        return res.status(200).json({ status: "success", token })
    } catch (error) {
        return res.status(500).json({ status: "Failed", error: error.message })
    }
})
Router.post("/Login", async (req, res) => {
    try {
        const admin = await AdminModel.FindByEmailAndPass(req.body.data);
        const token = await admin.genrateJwtToken();
        
        return res.status(200).json({ status: "success", token })
    } catch (error) {
        return res.status(500).json({ status: "failed", error: error.message })
    }
});
Router.get("/getAdmin",passport.authenticate("jwt", { session: false }), async (req, res) => {
    console.log("called");
    try {
        const { fullName, email, _id, phoneNumber,address } = req.user;

        return res.status(200).json({ admin: { fullName, email, _id, phoneNumber,address } })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});
Router.get("/getAllAdmin" ,async(Req,res)=>{
    try {
        const admins = await AdminModel.find().select('-password');
        return res.status(200).json({status:"success", admins})
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})
Router.put("/updateAdmin/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // const {admin} = req.body;

        console.log(req.body);
        const existingAdmin = await AdminModel.findById(id);
        if (req.body.address) {
            existingAdmin.address = req.body.address;
        }
        const updated = await existingAdmin.save();
        return res.status(200).json({ existingAdmin })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

export default Router