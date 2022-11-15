import express from "express";
import expressAsyncHandler from "express-async-handler";
import { cloudinaryRemove } from "../utils/cloudinary.js";

const testRouter = express.Router();

testRouter.delete("/:id", expressAsyncHandler(async(req, res, next) => {
    await cloudinaryRemove(req.params.id);
    res.status(200);
    res.json("ok");
}))

testRouter.get("/:id", expressAsyncHandler(async(req, res, next) => {
    const deleted = await cloudinaryRemove(req.params.id);
    res.status(200);
    res.json(deleted);
}))

export default testRouter;