import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { protect, auth } from '../middlewares/auth.middleware.js';
import userController from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get(
  '/profile',
  protect,
  auth('user', 'admin'),
  expressAsyncHandler(userController.getProfile)
);
userRouter.put(
  '/profile',
  protect,
  auth('user', 'admin'),
  expressAsyncHandler(userController.updateProfile)
);
userRouter.get(
  '/',
  protect,
  auth('admin'),
  expressAsyncHandler(userController.getUsersByAdmin)
);
userRouter.patch(
  '/change-password',
  protect,
  expressAsyncHandler(userController.changePassword)
);
userRouter.delete(
  '/:id',
  protect,
  auth('admin'),
  expressAsyncHandler(userController.deleteUserById)
);

export default userRouter;
