import express from "express";
import asyncHandler from "express-async-handler";
import { auth, protect } from "../middlewares/auth.middleware.js";
import orderController from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  protect,
  auth("user"),
  asyncHandler(orderController.placeOrder)
);
orderRouter.get(
  "/all",
  protect,
  auth("admin"),
  asyncHandler(orderController.getOrdersAndPaginate)
);
orderRouter.get(
  "/:id",
  protect,
  auth("user", "admin"),
  asyncHandler(orderController.getOrderById)
);
orderRouter.get(
  "/",
  protect,
  auth("user"),
  asyncHandler(orderController.getOrdersByUserId)
);
orderRouter.patch(
  "/:id",
  protect,
  auth("user", "admin"),
  asyncHandler(orderController.updateOrderStatus)
);
orderRouter.patch(
  "/:id/cancel",
  protect,
  auth("user", "admin"),
  asyncHandler(orderController.cancelOrder)
);
orderRouter.post(
  "/:id/orderItem/:orderItemId/product/:productId",
  protect,
  auth("user"),
  asyncHandler(orderController.reviewProductByOrderItemId)
);

export default orderRouter;
