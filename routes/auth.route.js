import express from "express";
import asyncHandler from "express-async-handler";
import authController from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/login", asyncHandler(authController.login));
authRouter.patch("/verify-email", asyncHandler(authController.verifyEmail));
authRouter.post("/register", asyncHandler(authController.register));
authRouter.patch(
  "/change-password",
  asyncHandler(authController.changePassword)
);
authRouter.patch(
  "/forgot-password",
  asyncHandler(authController.forgotPassword)
);
authRouter.patch("/reset-password", asyncHandler(authController.resetPassword));
authRouter.patch(
  "/cancel-verify-email",
  asyncHandler(authController.cancelVerifyEmail)
);
authRouter.patch(
  "/cancel-reset-password",
  asyncHandler(authController.cancelResetPassword)
);

export default authRouter;
