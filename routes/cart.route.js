import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, auth } from '../middlewares/auth.middleware.js';
import cartController from '../controllers/cart.controller.js';

const cartRouter = express.Router();

cartRouter.post(
  '/add',
  protect,
  auth('user'),
  expressAsyncHandler(cartController.addToCart)
);
cartRouter.patch(
  '/update',
  protect,
  auth('user'),
  expressAsyncHandler(cartController.updateCartItem)
);
cartRouter.patch(
  '/remove',
  protect,
  auth('user'),
  expressAsyncHandler(cartController.removeCartItems)
);
cartRouter.get(
  '/',
  protect,
  auth('user'),
  expressAsyncHandler(cartController.getCartByUserId)
);

export default cartRouter;
