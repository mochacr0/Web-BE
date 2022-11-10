import express from "express";
import expressAsyncHandler from "express-async-handler";
import categoryController from "../controllers/category.controller.js";
import { protect, auth } from "../middlewares/auth.middleware.js";

const categoryRouter = express.Router();

// categoryRouter.get("/all", expressAsyncHandler(categoryController.findAll));
categoryRouter.get(
  "/",
  expressAsyncHandler(categoryController.getAllCategories)
);
categoryRouter.get(
  "/:id",
  expressAsyncHandler(categoryController.getCategoryById)
);
categoryRouter.post(
  "/",
  expressAsyncHandler(categoryController.createCategory)
);
categoryRouter.put(
  "/",
  protect,
  auth("admin"),
  expressAsyncHandler(categoryController.updateCategory)
);
categoryRouter.delete(
  "/:id",
  protect,
  auth("admin"),
  expressAsyncHandler(categoryController.removeCategory)
);

export default categoryRouter;
