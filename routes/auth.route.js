import express from "express";
import asyncHandler from "express-async-handler";
import authController from "../controllers/auth.controller.js";
import passport from "passport";
import dotenv from "dotenv";
import {
  passportGoogleConfig,
  passportFacebookConfig,
} from "../config/passport.google.config.js";
import sendClientRedirectHTML from "../utils/sendClientRedirectHTML.js";

const authRouter = express.Router();

dotenv.config();
passportGoogleConfig(passport);
passportFacebookConfig(passport);

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
authRouter.get(
  "/google/login",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    res
      .cookie("accessToken", `${req.user.accessToken}`)
      .redirect("http://localhost:3000");
  }
);
authRouter.get(
  "/facebook/login",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);
authRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res, next) => {
    res
      .cookie("accessToken", `${req.user.accessToken}`)
      .redirect("http://localhost:3000");
  }
);
export default authRouter;
