const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { checkPermissions } = require("../utils");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "RandomValue";
  return { client_secret, amount };
};

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
    const dpProduct = await Product.findOne({ _id: item.product });

    if (!dpProduct) {
      throw new CustomError.NotFoundError("Product not found!");
    }

    const { name, price, image, _id } = dpProduct;

    const singleItemOrder = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleItemOrder];

    subTotal += item.amount * price;
  }

  const total = tax + shippingFee + subTotal;

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

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id });

  if (!order) {
    throw new CustomError.NotFoundError("Order not found!");
  }

  checkPermissions(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userID });

  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

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
