import schedule, { scheduleJob } from "node-schedule";
import crypto from "crypto";
import User from "../models/user.model.js";
import { sendMail } from "../utils/nodemailer.js";
import generateAuthToken from "../utils/generateToken.js";
import { htmlMailVerify, htmlResetEmail } from "../common/mailLayout.js";
import image from "../common/images.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email, isVerified: true });

  if (user && (await user.matchPassword(password))) {
    res.status(200);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      accessToken: generateAuthToken({ _id: user._id }),
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
};

const register = async (req, res, next) => {
  const { name, phone, password } = req.body;
  const email = req.body.email.toString().toLowerCase();
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
  });
  const emailVerificationToken = user.getEmailVerificationToken();
  await user.save();
  const html = htmlMailVerify(emailVerificationToken);

  //start cron-job
  let scheduledJob = schedule.scheduleJob(
    `*/${process.env.EMAIL_VERIFY_EXPIED_TIME_IN_MINUTE} * * * *`,
    async () => {
      console.log("Job run");
      const foundUser = await User.findOneAndDelete({
        _id: user._id,
        isVerified: false,
      });
      console.log(foundUser);
      scheduledJob.cancel();
    }
  );
  //set up message options
  const messageOptions = {
    recipient: user.email,
    subject: "Verify Email",
    html: html,
  };
  //send verify email
  try {
    await sendMail(messageOptions);
    res.status(200);
    res.json({ message: "Sending verification mail successfully" });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  const emailVerificationToken = req.query.emailVerificationToken || null;
  const hashedToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    isVerified: false,
  });
  if (!user) {
    res.status(400);
    throw new Error({ message: "Email verification token is not valid" });
  }
  user.isVerified = true;
  user.emailVerificationToken = null;
  const verifiedUser = await user.save();
  // const cart = await Cart.create({
  //   user: verifiedUser._id,
  //   cartItems: [],
  // });
  res.status(200);
  res.json({ accessToken: generateAuthToken({ _id: verifiedUser._id }) });
};

const cancelVerifyEmail = async (req, res) => {
  const emailVerificationToken = req.query.emailVerificationToken || null;
  const hashedToken = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");
  const user = await User.findOneAndDelete({
    emailVerificationToken: hashedToken,
    isVerified: false,
  });
  if (!user) {
    res.status(400);
    throw new Error("Email verification token is not valid");
  }
  res.status(200);
  res.json({ message: "Canceling email verification succeed" });
};

const forgotPassword = async (req, res) => {
  const email = req.body.email || null;
  const user = await User.findOne({ email: email, isVerified: true });
  if (!user) {
    res.status(400);
    throw new Error("Email not found");
  }
  //reset password
  const resetPasswordToken = user.getResetPasswordToken();
  await user.save();
  //send reset password email
  const url = `http://localhost:3000/reset?resetPasswordToken=${resetPasswordToken}`;
  const html = htmlResetEmail({ link: url, email, urlLogo: image.logo });
  //set up message options
  const messageOptions = {
    recipient: user.email,
    subject: "Reset Password",
    html: html,
  };
  //send verify email
  try {
    await sendMail(messageOptions);
    res.status(200);
    res.json({ messsage: "Sending reset password mail successfully" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res) => {
  const resetPasswordToken = req.query.resetPasswordToken || null;
  const email = req.body.email || null;
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword) {
    res.status(400);
    throw new Error("Your new password is not valid");
  }
  if (newPassword.localeCompare(confirmPassword) != 0) {
    res.status(400);
    throw new Error("The password and confirmation password do not match");
  }
  const isEmailExisted = await User.findOne({ email: email, isVerified: true });
  if (!isEmailExisted) {
    res.status(400);
    throw new Error("Email not found");
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");
  const user = await User.findOne({
    _id: isEmailExisted._id,
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpiryTime: {
      $gte: Date.now(),
    },
    isVerified: true,
  });
  if (!user) {
    res.status(400);
    throw new Error("Reset password token is not valid");
  }
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiryTime = null;
  await user.save();
  res.status(200);
  res.json({ message: "Your password has been reset" });
};

const cancelResetPassword = async (req, res) => {
  const resetPasswordToken = req.query.resetPasswordToken || null;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");
  const user = await User.findOneAndUpdate(
    {
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpiryTime: {
        $gte: Date.now(),
      },
      isVerified: true,
    },
    {
      resetPasswordToken: null,
      resetPasswordTokenExpiryTime: null,
    }
  );
  if (!user) {
    res.status(400);
    throw new Error("Reset password token is not found");
  }
  res.status(200);
  res.json({ message: "Canceling reset password succeed" });
};

const authController = {
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  cancelVerifyEmail,
  cancelResetPassword,
};
export default authController;
