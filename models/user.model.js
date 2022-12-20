import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// const failedLoginAttempts = mongoose.Schema({
//   count: {
//     type: Number,
//     required: false,
//     default: 0,
//   },
//   firstFailedLoginAttempt: {
//     type: Number,
//     required: false,
//     default: 0,
//   },
// });

// const forgotPasswordAttempts = mongoose.Schema({
//   count: {
//     type: Number,
//     required: false,
//     default: 0,
//   },
//   firstForgotPasswordAttempt: {
//     type: Number,
//     required: false,
//     default: 0,
//   },
//   firstForgotPasswordAttemptIpAddress: {
//     type: String,
//     required: false,
//   },
// });

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
      default: 'user',
    },
    emailVerificationToken: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordTokenExpiryTime: {
      type: Number,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    facebookId: {
      type: String,
      required: false,
    },
    failedLoginAttempts: {
      type: Object,
      default: {},
    },
    // failedLoginLockExpiryTime: {
    //   type: Number,
    //   required: false,
    // },
    forgotPasswordAttempts: {
      type: Object,
      default: {},
    },
    forgotPasswordLockExpiryTime: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Login
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetPasswordToken)
    .digest('hex');
  this.resetPasswordTokenExpiryTime =
    Date.now() + process.env.RESET_PASSWORD_EXPIRY_TIME_IN_MINUTE * 60 * 1000;
  return resetPasswordToken;
};

userSchema.methods.getEmailVerificationToken = function () {
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  return emailVerificationToken;
};

// Register
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
