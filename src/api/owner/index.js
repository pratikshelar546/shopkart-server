import express from "express"
import { OwnerModel } from "../../database/ownerModel";
const Router = express.Router();

Router.post('/AddOwner', async (req, res) => {
    try {
        const addOwner = await OwnerModel.create(req.body.data);
        const token = addOwner.genrateJwtToken();
        return res.status(200).json({ status: "success", message: token })
    } catch (error) {
        return res.status(500).json({ status: "failed", message: error.message })
    }
})
Router.post('/login', async (req, res) => {
    try {
        const owner = await OwnerModel.FindByEmailAndPass(req.body.data);
        const token = await owner.genrateJwtToken();
        return res.status(200).json({ status: "success", message: token })
    } catch (error) {
        return res.status(500).json({ status: "Failed", message: error.message })
    }
})
export default Router