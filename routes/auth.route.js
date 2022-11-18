import express from "express";
import expressAsyncHandler from "express-async-handler";
import authController from "../controllers/auth.controller.js";
import passport from "passport";
import dotenv from "dotenv";
import {
  passportGoogleConfig,
  passportFacebookConfig,
} from "../config/passport.config.js";

const authRouter = express.Router();

passportGoogleConfig(passport);
passportFacebookConfig(passport);

authRouter.post("/login", expressAsyncHandler(authController.login));
authRouter.patch(
  "/verify-email",
  expressAsyncHandler(authController.verifyEmail)
);
authRouter.post("/register", expressAsyncHandler(authController.register));
authRouter.patch(
  "/forgot-password",
  expressAsyncHandler(authController.forgotPassword)
);
authRouter.patch(
  "/reset-password",
  expressAsyncHandler(authController.resetPassword)
);
authRouter.patch(
  "/cancel-verify-email",
  expressAsyncHandler(authController.cancelVerifyEmail)
);
authRouter.patch(
  "/cancel-reset-password",
  expressAsyncHandler(authController.cancelResetPassword)
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
