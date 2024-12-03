/**
 * @fileoverview Order Controller
 * Handles all order-related operations including creating orders,
 * processing payments, and managing order status.
 * 
 * This controller implements features including:
 * - Order creation and management
 * - Payment processing (mock Stripe integration)
 * - Order status updates
 * - User-specific order retrieval
 */

const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { checkPermissions } = require("../utils");

/**
 * Mock Stripe payment processing
 * @async
 * @function fakeStripeAPI
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Payment amount
 * @param {string} params.currency - Payment currency
 * @returns {Promise<Object>} - Returns mock payment intent
 */
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "RandomValue";
  return { client_secret, amount };
};

/**
 * Create a new order
 * @async
 * @function createOrder
 * @param {Object} req - Express request object
 * @param {Object} req.body - Order data
 * @param {Array} req.body.items - Cart items
 * @param {number} req.body.tax - Order tax amount
 * @param {number} req.body.shippingFee - Shipping fee
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns created order with payment intent
 * @throws {CustomError.BadRequestError} - If cart items, tax, or shipping fee missing
 * @throws {CustomError.NotFoundError} - If product not found
 */
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("No cart items provided!");
  }

  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("No tax or shippingFee provided!");
  }

  let orderItems = [];
  let subTotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });

    if (!dbProduct) {
      throw new CustomError.NotFoundError("Product not found!");
    }

    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    // Add item to order
    orderItems = [...orderItems, singleOrderItem];
    // Calculate subtotal
    subTotal += item.amount * price;
  }

  // Calculate total
  const total = tax + shippingFee + subTotal;

  // Get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subTotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userID,
  });

  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};

/**
 * Retrieve all orders (admin only)
 * @async
 * @function getAllOrders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of all orders
 */
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

/**
 * Retrieve a single order
 * @async
 * @function getSingleOrder
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns order details
 * @throws {CustomError.NotFoundError} - If order not found
 * @throws {CustomError.UnauthorizedError} - If user not authorized
 */
const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    throw new CustomError.NotFoundError("Order not found!");
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

/**
 * Retrieve current user's orders
 * @async
 * @function getCurrentUserOrders
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of user's orders
 */
const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userID });

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

/**
 * Update order status
 * @async
 * @function updateOrder
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Order ID
 * @param {Object} req.body - Updated order data
 * @param {string} req.body.paymentID - Payment ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns updated order
 * @throws {CustomError.NotFoundError} - If order not found
 * @throws {CustomError.UnauthorizedError} - If user not authorized
 */
const updateOrder = async (req, res) => {
  const { paymentID } = req.body;

  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    throw new CustomError.NotFoundError("Order not found!");
  }

  checkPermissions(req.user, order.user);

  order.paymentID = paymentID;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
