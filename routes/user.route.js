import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, auth } from '../middlewares/auth.middleware.js';
import userController from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/profile', protect, auth('user', 'admin'), asyncHandler(userController.getProfile));
userRouter.put('/profile', protect, auth('user', 'admin'), asyncHandler(userController.updateProfile));
userRouter.get('/', protect, auth('admin'), asyncHandler(userController.getUsersByAdmin));

export default userRouter;