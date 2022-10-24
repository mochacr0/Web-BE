import express from "express";
import expressAsyncHandler from "express-async-handler";
import { protect, auth } from "../middlewares/auth.middleware.js";
import productController from "../controllers/product.controller.js";
import { multerUpload } from "../utils/multer.js";

const productRouter = express.Router();

productRouter.get(
  "/ProductAll",
  expressAsyncHandler(productController.getAllProducts)
);
productRouter.get(
  "/admin",
  protect,
  auth("admin"),
  expressAsyncHandler(productController.getAllProductsByAdmin)
);
productRouter.get(
  "/search",
  expressAsyncHandler(productController.getProductSearchResults)
);
productRouter.post(
  "/:id/review",
  protect,
  auth("user"),
  expressAsyncHandler(productController.reviewProduct)
);
productRouter.get(
  "/:id",
  expressAsyncHandler(productController.getProductById)
);
productRouter.delete(
  "/:id",
  protect,
  auth("admin"),
  expressAsyncHandler(productController.deleteProduct)
);
productRouter.put(
  "/:id",
  protect,
  auth("admin"),
  multerUpload.single("productImage"),
  expressAsyncHandler(productController.updateProduct)
);
productRouter.post(
  "/",
  protect,
  auth("admin"),
  multerUpload.single("productImage"),
  expressAsyncHandler(productController.createProduct)
);
productRouter.get("/", expressAsyncHandler(productController.getProducts));

export default productRouter;
