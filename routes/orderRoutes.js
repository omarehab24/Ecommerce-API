const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");

/**
 * Express router for order-related routes
 * 
 * This router handles various order management endpoints:
 * - Create new orders
 * - Retrieve orders (all, current user's, single order)
 * - Update existing orders
 * 
 * All routes require user authentication
 * 
 * @module OrderRoutes
 * @requires express
 * @requires ../middleware/authentication
 * @requires ../controllers/orderController
 */

// Authenticate all order routes
router.use(authenticateUser);

/**
 * Routes for creating and retrieving all orders
 * 
 * @route GET /api/v1/orders
 * @route POST /api/v1/orders
 * 
 * @middleware authorizePermissions - Only admin can retrieve all orders
 */
router
  .route("/")
  .get(authorizePermissions("admin"), getAllOrders)
  .post(createOrder);

/**
 * Route for retrieving current user's orders
 * 
 * @route GET /api/v1/orders/showAllMyOrders
 * @returns {Array} List of current user's orders
 */
router.route("/showAllMyOrders").get(getCurrentUserOrders);

/**
 * Routes for retrieving and updating a specific order
 * 
 * @route GET /api/v1/orders/:id
 * @route PATCH /api/v1/orders/:id
 * 
 * @param {string} id - Order identifier
 */
router.route("/:id").get(getSingleOrder).patch(updateOrder);

module.exports = router;
