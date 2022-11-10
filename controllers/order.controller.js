import mongoose from "mongoose";
import schedule, { scheduleJob } from "node-schedule";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Variant from "../models/variant.model.js";
import Cart from "../models/cart.model.js";
import {
  validateStatus,
  validateStatusBeforeCancel,
} from "../utils/orderConstants.js";
import {
  orderQueryParams,
  validateConstants,
} from "../utils/searchConstants.js";

const getOrdersByUserId = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20; //EDIT HERE
  const page = Number(req.query.pageNumber) || 1;
  const dateOrderSortBy = validateConstants(
    orderQueryParams,
    "date",
    req.query.dateOrder
  );
  const orderFilter = { user: req.user._id };
  const count = await Order.countDocuments(orderFilter);
  const orders = await Order.find({ ...orderFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ ...dateOrderSortBy });
  res.status(200);
  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }
  res.status(200);
  res.json(order);
};

const getOrdersAndPaginate = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20; //EDIT HERE
  const page = Number(req.query.pageNumber) || 1;
  const dateOrderSortBy = validateConstants(
    orderQueryParams,
    "date",
    req.query.dateOrder
  );
  const orderStatusFilter = validateConstants(
    orderQueryParams,
    "orderStatus",
    req.query.orderStatus
  );
  const orderFilter = {
    ...orderStatusFilter,
  };
  const count = await Order.countDocuments(orderFilter);
  const orders = await Order.find({ ...orderFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ ...dateOrderSortBy });
  res.status(200);
  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    totalOrders: count,
  });
};

const getOrderShippingAddressByUserId = async (req, res) => {
  const order = await Order.find({ user: req.user._id });
  if (order) {
    res.json(order[order.length - 1].shippingAddress);
  } else {
    res.status(404);
    throw new Error("Not found order of user");
  }
};

const placeOrder = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
    contactInformation,
  } = req.body;
  const orderItemIds = orderItems.map((orderItem) => orderItem.variant);
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  try {
    await session.withTransaction(async () => {
      const order = new Order({
        orderItems: [],
        user: req.user._id,
        username: req.user.name,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
        contactInformation,
        status: "Placed",
      });
      let dataFilledrOrderItems = [];
      // for (const orderItem of orderItems) {
      //     const orderedVariant = await Variant.findOneAndUpdate(
      //         { _id: orderItem.variant, quantity: { $gte: orderItem.quantity } },
      //         { $inc: { quantity: -orderItem.quantity } },
      //         { new: true },
      //     ).session(session);
      //     if (!orderedVariant) {
      //         await session.abortTransaction();
      //         res.status(400);
      //         throw new Error('One or more product order quantity exceed available quantity');
      //     }
      //     const orderedProduct = await Product.findOneAndUpdate(
      //         { _id: orderedVariant.product },
      //         { $inc: { totalSales: +orderItem.quantity } },
      //     ).session(session);
      //     if (!orderedProduct) {
      //         await session.abortTransaction();
      //         res.status(400);
      //         throw new Error('Variant product is not valid');
      //     }
      //     let dataFilledrOrderItem = {
      //         product: orderedVariant.product,
      //         name: orderedProduct.name,
      //         size: orderedVariant.size,
      //         color: orderedVariant.color,
      //         price: orderedVariant.price,
      //         ...orderItem,
      //     };
      //     dataFilledrOrderItems.push(dataFilledrOrderItem);
      // }
      const createOrderItems = orderItems.map(async (orderItem) => {
        const orderedVariant = await Variant.findOneAndUpdate(
          { _id: orderItem.variant, quantity: { $gte: orderItem.quantity } },
          { $inc: { quantity: -orderItem.quantity } },
          { new: true }
        ).session(session);
        if (!orderedVariant) {
          await session.abortTransaction();
          res.status(400);
          throw new Error(
            "One or more product order quantity exceed available quantity"
          );
        }
        const orderedProduct = await Product.findOneAndUpdate(
          { _id: orderedVariant.product },
          { $inc: { totalSales: +orderItem.quantity } }
        ).session(session);
        if (!orderedProduct) {
          await session.abortTransaction();
          res.status(400);
          throw new Error("Variant product is not valid");
        }
        let dataFilledrOrderItem = {
          product: orderedVariant.product,
          name: orderedProduct.name,
          image: orderedProduct.image,
          size: orderedVariant.size,
          color: orderedVariant.color,
          price: orderedVariant.price,
          ...orderItem,
        };
        dataFilledrOrderItems.push(dataFilledrOrderItem);
      });
      await Promise.all(createOrderItems);
      order.orderItems = dataFilledrOrderItems;
      const updatedCart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { cartItems: { variant: { $in: orderItemIds } } } }
      ).session(session);
      if (!updatedCart) {
        await session.abortTransaction();
        res.status(500);
        throw new Error("Removing ordered items from cart failed");
      }
      order.statusHistory.push({ status: "Placed" });
      const createdOrder = await order.save();
      if (!createdOrder) {
        await session.abortTransaction();
        res.status(500);
        throw new Error("Encounter error while placing new order");
      }
      res.status(201);
      res.json(createdOrder);
    }, transactionOptions);
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id || null;
  const { status, description } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const errorMessage = validateStatus(order, status, req.user.role);
  if (errorMessage.length != 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  const existedStatusHistoryIndex = order.statusHistory.findLastIndex(
    (history) => history.status == status
  );
  if (existedStatusHistoryIndex == -1) {
    order.statusHistory.push({ status: status, description: description });
    order.status = status;
    if (status == "Paid") {
      order.orderItems.map((orderItem) => {
        orderItem.isAbleToReview = true;
      });
    }
    if (status == "Delivering") {
      //start a cron job to automatically change the order status to "Paid" after 7 days of delivery
      let scheduledJob = schedule.scheduleJob(
        `* * */${process.env.AUTO_PAID_CONFIRMATION_TIME_IN_DAY} * *`,
        async () => {
          const autoConfirmOrder = await Order.findOne({
            _id: order._id,
            status: "Delivering",
          });
          if (autoConfirmOrder) {
            autoConfirmOrder.status = "Paid";
            autoConfirmOrder.statusHistory.push({
              status: "Paid",
              description: "",
            });
          }
          await autoConfirmOrder.save();
          scheduledJob.cancel();
        }
      );
    }
  } else {
    if (order.status != status || order.status == "Paid") {
      res.status(400);
      throw new Error(
        `Cannot undo status ${status} when order is ${order.status.toLowerCase()}`
      );
    }
    order.statusHistory.splice(existedStatusHistoryIndex);
    order.status = order.statusHistory[order.statusHistory.length - 1].status;
  }
  await order.save();
  res.status(200);
  res.json({ message: "Order status is updated" });
};

const cancelOrder = async (req, res, next) => {
  const orderId = req.params.id || null;
  const { description } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const errorMessage = validateStatusBeforeCancel(order, req.user.role);
  if (errorMessage.length != 0) {
    res.status(400);
    throw new Error(errorMessage);
  }
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  try {
    await session.withTransaction(async () => {
      for (const orderItem of order.orderItems) {
        const returnedVariant = await Variant.findOneAndUpdate(
          { _id: orderItem.variant },
          { $inc: { quantity: +orderItem.quantity } },
          { new: true }
        ).session(session);
        await Product.findOneAndUpdate(
          { _id: returnedVariant.product },
          { $inc: { totalSales: -orderItem.quantity } }
        ).session(session);
      }
      order.status = "Cancelled";
      order.statusHistory.push({
        status: "Cancelled",
        description: description,
      });
      const cancelledOrder = await order.save();
      if (!cancelledOrder) {
        await session.abortTransaction();
        res.status(500);
        throw new Error("Encounter error while cancelling order");
      }
      res.status(200);
      res.json({ message: "Cancel order successfully" });
    }, transactionOptions);
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const deleteOrder = async (req, res) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  if (!deletedOrder) {
    res.status(400);
    throw new Error("Order not found");
  }
  res.status(200);
  res.json("Order had been removed");
};

const reviewProductByOrderItemId = async (req, res) => {
  const { rating, comment } = req.body;
  const orderId = req.params.id || null;
  const orderItemId = req.params.orderItemId || null;
  const productId = req.params.productId || null;
  const findOrder = Order.findOne({
    _id: orderId,
    orderItems: {
      $elemMatch: {
        _id: orderItemId,
        product: productId,
        isAbleToReview: true,
      },
    },
  });
  const findProduct = Product.findById(productId);
  const [order, product] = await Promise.all([findOrder, findProduct]);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment: comment,
    user: req.user._id,
  };
  product.reviews.push(review);
  product.rating =
    product.reviews.reduce(
      (previousValue, curentReview) => curentReview.rating + previousValue,
      0
    ) / product.reviews.length;
  const reviewOrderIndex = order.orderItems.findIndex((orderItem) => {
    return orderItem._id.toString() == orderItemId.toString();
  });
  if (reviewOrderIndex != -1) {
    order.orderItems[reviewOrderIndex].isAbleToReview = false;
    await Promise.all([product.save(), order.save()]);
  } else {
    await product.save();
  }
  res.status(201);
  res.json({ message: "Added review" });
};

Array.prototype.findLastIndex = function (callbackFn) {
  let lastIndex = -1;
  for (let i = this.length - 1; i >= 0; i--) {
    if (callbackFn(this[i])) {
      lastIndex = i;
      break;
    }
  }
  return lastIndex;
};

const orderController = {
  getOrderById,
  getOrdersByUserId,
  getOrdersAndPaginate,
  getOrderShippingAddressByUserId,
  placeOrder,
  updateOrderStatus,
  cancelOrder,
  reviewProductByOrderItemId,
  deleteOrder,
};

export default orderController;
