import express from "express";
import expressAsyncHandler from "express-async-handler";
import categoryController from "../controllers/category.controller.js";

const categoryRouter = express.Router();

// categoryRouter.get("/all", expressAsyncHandler(categoryController.findAll));
categoryRouter.get("/", expressAsyncHandler(categoryController.findAll));
categoryRouter.get("/:id", expressAsyncHandler(categoryController.findById));
categoryRouter.post("/", expressAsyncHandler(categoryController.create));
categoryRouter.put("/", expressAsyncHandler(categoryController.update));
categoryRouter.delete("/:id", expressAsyncHandler(categoryController.remove));

export default categoryRouter;
