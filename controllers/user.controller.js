import User from '../models/user.model.js';
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

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.city = req.body.city || user.city;
        user.country = req.body.country || user.country;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            city: updatedUser.city,
            country: updatedUser.country,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

const getUsersByAdmin = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

const deleteUserById = async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        res.status(404);
        throw new Error('User not found');
    }
    await Cart.findOneAndDelete({ user: deletedUser });
    res.status(200);
    res.json({ message: 'User had been removed' });
};

const userController = {
    getProfile,
    updateProfile,
    getUsersByAdmin,
    deleteUserById,
};
export default userController;