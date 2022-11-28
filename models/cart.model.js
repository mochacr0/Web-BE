import mongoose from 'mongoose';
const cartItem = mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Variant',
    },
    // name: { type: String, required: true },
    // image: { type: String, required: true },
    // price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // countInStock: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);
const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cartItems: [cartItem],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
