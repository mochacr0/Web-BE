import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const generateAuthToken = (payload, willExpired = true) => {
  if (willExpired) {
    return jwt.sign({ payload }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
  } else {
    return jwt.sign({ payload }, process.env.JWT_SECRET);
  }
};
export default generateAuthToken;
