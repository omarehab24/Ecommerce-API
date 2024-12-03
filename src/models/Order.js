const mongoose = require("mongoose");

/**
 * Schema for individual order items
 * 
 * Represents a single product within an order, capturing
 * essential details for order processing and tracking.
 * 
 * @typedef {Object} SingleOrderItem
 * @property {string} name - Name of the product
 * @property {string} image - URL or path to product image
 * @property {number} price - Price of the product
 * @property {number} amount - Quantity of the product in the order
 * @property {mongoose.Schema.ObjectId} product - Reference to the Product model
 */
const singleOrderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
});

/**
 * Mongoose schema for Order model
 * 
 * Represents a complete order in the e-commerce system,
 * including financial details, order status, and user information.
 * 
 * @typedef {Object} Order
 * @property {number} tax - Tax amount for the order
 * @property {number} shippingFee - Shipping cost for the order
 * @property {number} subTotal - Subtotal before tax and shipping
 * @property {number} total - Total order amount including tax and shipping
 * @property {SingleOrderItem[]} orderItems - List of items in the order
 * @property {string} status - Current status of the order
 * @property {string} clientSecret - Payment client secret for transaction
 * @property {string} [paymentID] - Optional payment transaction ID
 * @property {mongoose.Schema.ObjectId} user - Reference to the User model
 * 
 * @property {Date} createdAt - Timestamp of order creation
 * @property {Date} updatedAt - Timestamp of last order update
 */
const orderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [singleOrderItemSchema],

    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentID: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Transform function to modify the returned object
 * 
 * Removes the version key from the returned object
 * to reduce unnecessary metadata in API responses.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
orderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

/**
 * Transform function for toObject method
 * 
 * Ensures consistent object representation when converting
 * Mongoose documents to plain JavaScript objects.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
orderSchema.set('toObject', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

/**
 * Order model representing customer orders
 * 
 * Provides an interface for creating, querying, and managing
 * orders in the e-commerce application.
 * 
 * @type {mongoose.Model}
 */
module.exports = mongoose.model("Order", orderSchema);
