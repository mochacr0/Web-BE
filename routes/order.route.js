import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { auth, protect } from '../middlewares/auth.middleware.js';
import orderController from '../controllers/order.controller.js';

const orderRouter = express.Router();

orderRouter.post(
  '/',
  protect,
  auth('user'),
  expressAsyncHandler(orderController.placeOrder)
);
orderRouter.get(
  '/all',
  protect,
  auth('admin', 'shipper'),
  expressAsyncHandler(orderController.getOrdersAndPaginate)
);
orderRouter.get(
  '/:id',
  protect,
  auth('shipper', 'admin', 'user'),
  expressAsyncHandler(orderController.getOrderById)
);
orderRouter.get(
  '/',
  protect,
  auth('user'),
  expressAsyncHandler(orderController.getOrdersByUserId)
);
orderRouter.patch(
  '/:id',
  protect,
  auth('shipper', 'admin', 'user'),
  expressAsyncHandler(orderController.updateOrderStatus)
);
orderRouter.patch(
  '/:id/cancel',
  protect,
  auth('shipper', 'admin', 'user'),
  expressAsyncHandler(orderController.cancelOrder)
);
orderRouter.post(
  '/:id/orderItems/:orderItemId/products/:productId',
  protect,
  auth('user'),
  expressAsyncHandler(orderController.reviewProductByOrderItemId)
);

export default orderRouter;
