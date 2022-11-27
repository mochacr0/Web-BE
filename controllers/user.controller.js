import User from '../models/user.model.js';
import Cart from '../models/cart.model.js';
import generateAuthToken from '../utils/generateToken.js';
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select({
    password: 0,
    isVerified: 0,
    emailVerificationToken: 0,
    resetPasswordToken: 0,
    resetPasswordTokenExpiryTime: 0,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.address = req.body.address || user.address;
  user.city = req.body.city || user.city;
  user.country = req.body.country || user.country;
  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address,
    city: updatedUser.city,
    country: updatedUser.country,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  });
};

const getUsersByAdmin = async (req, res) => {
  const users = await User.find().select({
    name: 1,
    email: 1,
    role: 1,
  });
  res.json(users);
};

const deleteUserById = async (req, res) => {
  const existingUser = await User.findById(req.params.id);
  if (!existingUser) {
    res.status(404);
    throw new Error('User not found');
  }
  await Cart.findOneAndDelete({ user: existingUser });
  await existingUser.remove();
  res.status(200);
  res.json({ message: 'User had been removed' });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword && currentPassword.length() <= 0) {
    res.status(400);
    throw new Error('Current password is not valid');
  }
  if (!newPassword && newPassword.length() <= 0) {
    res.status(400);
    throw new Error('New password is not valid');
  }
  console.log(req);
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (await user.matchPassword(req.body.currentPassword)) {
    user.password = newPassword;
    await user.save();
    res.status(200);
    res.json({
      accessToken: generateAuthToken({ _id: user._id }),
    });
  } else {
    res.status(400);
    throw new Error('Current password is not correct!');
  }
};

const userController = {
  getProfile,
  updateProfile,
  changePassword,
  getUsersByAdmin,
  deleteUserById,
};
export default userController;
