const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");

const fileUpload = require("express-fileupload");

/**
 * Express router for product-related routes
 * 
 * This router handles various product management endpoints:
 * - Create new products
 * - Retrieve products (all, single product)
 * - Update and delete products
 * - Upload product images
 * - Retrieve product reviews
 * 
 * Most routes require admin authentication
 * 
 * @module ProductRoutes
 * @requires express
 * @requires ../middleware/authentication
 * @requires ../controllers/productController
 * @requires ../controllers/reviewController
 * @requires express-fileupload
 */

/**
 * Routes for creating and retrieving all products
 * 
 * @route GET /api/v1/products
 * @route POST /api/v1/products
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @middleware authorizePermissions - Only admin can create products
 */
router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
  .get(getAllProducts);

/**
 * Route for uploading product images
 * 
 * @route POST /api/v1/products/uploadImage
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @middleware authorizePermissions - Only admin can upload images
 * @middleware fileUpload - Handles file upload
 */
router
  .route("/uploadImage")
  .post(
    [authenticateUser, authorizePermissions("admin"), fileUpload()],
    uploadImage
  );

/**
 * Routes for retrieving, updating, and deleting a specific product
 * 
 * @route GET /api/v1/products/:id
 * @route PATCH /api/v1/products/:id
 * @route DELETE /api/v1/products/:id
 * 
 * @param {string} id - Product identifier
 * 
 * @middleware authenticateUser - Ensures user is authenticated for update/delete
 * @middleware authorizePermissions - Only admin can update/delete products
 */
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

/**
 * Route for retrieving reviews for a specific product
 * 
 * @route GET /api/v1/products/:id/reviews
 * 
 * @param {string} id - Product identifier
 * @returns {Array} List of reviews for the specified product
 */
router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
