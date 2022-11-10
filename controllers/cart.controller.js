import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";

const getCartByUserId = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "cartItems.variant",
    populate: { path: "product" },
  });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200);
  res.json(cart.cartItems);
};

/* const addToCart = async (req, res) => {
    const { productId, quantity, _id } = req.body;
    const product = await Product.findById(productId);
    const cartExist = await Cart.findOne({ user: _id });
    if (cartExist) {
        //update
        const productExit = cartExist?.cartItems?.find((value) => value.product == productId);
        if (productExit) {
            const newArray = cartExist?.cartItems;
            for (let i = 0; i <= newArray.length - 1; i++) {
                if (newArray[i].product == productId && typeof quantity != 'boolean') {
                    newArray[i].quantity = quantity;
                }
                if (newArray[i].product == productId && typeof quantity == 'boolean') {
                    newArray[i].isBuy = !newArray[i]?.isBuy;
                }
            }
            cartExist.cartItems = newArray;
            await cartExist.save();
            res.status(201).json('success');
            return;
        }
        const cartadd = {
            product: productId,
            // name: product.name,
            // image: product.image,
            // price: product.price,
            quantity: quantity,
            // countInStock: product.countInStock,
        };
        cartExist.cartItems.push(cartadd);
        await cartExist.save();
        const cartCurrent = cartExist.cartItems;
        res.status(201).json(cartCurrent);
        return;
    } else {
        const newCart = new Cart({
            user: _id,
            cartItems: [
                {
                    product: productId,
                    // name: product.name,
                    // image: product.image,
                    // price: product.price,
                    quantity,
                    // countInStock: product.countInStock,
                },
            ],
        });
        const createCart = await newCart.save();
        res.status(201).json(createCart.cartItems);
        return;
    }
}; */

// const removeItemFromCart = async (req, res) => {
//     const { user, pr } = req.body;
//     // const user = req.query.us
//     // const pr = req.params.pr
//     const cartExist = await Cart.findOne({ user: user });

//     if (cartExist) {
//         //update
//         const newArray = cartExist.cartItems;
//         const productExit = newArray.find((value) => value.product == pr);
//         if (!productExit) {
//             res.status(404);
//             throw new Error('Product not found');
//         }
//         cartExist.cartItems = newArray.filter((value) => value.product != pr);
//         await cartExist.save();
//         res.status(201).json('Success');
//     } else {
//         res.status(404);
//         throw new Error(`user:${user} , pr: ${pr}`);
//     }
// };

// const clearCart = async (req, res) => {
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (cart) {
//         await Cart.updateMany({ user: req.user._id }, { $pull: { cartItems: { isBuy: true } } });
//         // await cart.save();
//         res.json({ message: 'Cart clear' });
//     } else {
//         res.status(404);
//         throw new Error('Can not clear this cart');
//     }
// };

const addToCart = async (req, res) => {
  const { variantId, quantity } = req.body;
  const findCart = Cart.findOne({ user: req.user._id });
  const findVariant = Variant.findById(variantId);
  const [cart, variant] = await Promise.all([findCart, findVariant]);
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  if (!variant) {
    res.status(400);
    throw new Error("Product variantation not found");
  }
  if (quantity <= 0) {
    res.status(400);
    throw new Error("Quantity must be greater than 0");
  }
  let isQuantityValid = true;
  let currentQuantity = 0;
  const addedItemIndex = cart.cartItems.findIndex(
    (item) => item.variant.toString() == variant._id.toString()
  );
  if (addedItemIndex !== -1) {
    currentQuantity = cart.cartItems[addedItemIndex].quantity;
    // cart.cartItems[addedItemIndex].quantity += quantity;
    // if (cart.cartItems[addedItemIndex].quantity > variant.quantity) {
    //     res.status(400);
    //     throw new Error('You have exceeded the maximum quantity available for this item');
    // }
  }
  isQuantityValid = quantity + currentQuantity <= variant.quantity;
  if (!isQuantityValid) {
    res.status(400);
    throw new Error(
      "You have exceeded the maximum quantity available for this item"
    );
  }
  if (addedItemIndex !== -1) {
    cart.cartItems[addedItemIndex].quantity = quantity + currentQuantity;
  } else {
    const cartItem = {
      variant: variant._id,
      quantity: quantity,
    };
    cart.cartItems.push(cartItem);
  }

  // else {
  //     if (quantity > variant.quantity) {
  //         res.status(400);
  //         throw new Error('You have exceeded the maximum quantity available for this item');
  //     }
  //     const cartItem = {
  //         variant: variant._id,
  //         quantity: quantity,
  //     };
  //     cart.cartItems.push(cartItem);
  // }
  await cart.save();
  res.status(200);
  res.json({ message: "Cart item is added" });
};

const updateCartItem = async (req, res) => {
  const { variantId, quantity } = req.body;
  const findCart = Cart.findOne({ user: req.user._id });
  const findVariant = Variant.findById(variantId);
  const [cart, variant] = await Promise.all([findCart, findVariant]);
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  if (!variant) {
    res.status(400);
    throw new Error("Product variantation not found");
  }
  if (quantity > variant.quantity) {
    res.status(400);
    throw new Error(
      "You have exceeded the maximum quantity available for this item"
    );
  }
  const addedItemIndex = cart.cartItems.findIndex(
    (item) => item.variant.toString() == variantId.toString()
  );
  if (addedItemIndex == -1) {
    res.status(400);
    throw new Error("Cart item is not in cart");
  }
  cart.cartItems[addedItemIndex].quantity = quantity;
  let message = "";
  if (cart.cartItems[addedItemIndex].quantity <= 0) {
    cart.cartItems.splice(addedItemIndex, 1);
    message = "Cart item is removed";
  } else {
    await cart.save();
    res.status(200);
    message = "Cart item is updated";
  }
  await cart.save();
  res.status(200);
  res.json({ message });
};

const removeCartItems = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  //productIds: [productId1, productId2, ...]
  const variantIds = req.body.variantIds;
  await Cart.updateMany(
    { _id: cart._id },
    { $pull: { cartItems: { variant: { $in: variantIds } } } }
  );
  res.status(200);
  res.json({ message: "Cart items are removed" });
};

const cartController = {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeCartItems,
};
export default cartController;
