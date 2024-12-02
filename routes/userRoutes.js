const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

/**
 * Express router for user-related routes
 * 
 * This router handles various user management endpoints:
 * - Retrieve all users (admin only)
 * - Retrieve current user details
 * - Retrieve single user details
 * - Update user profile
 * - Update user password
 * 
 * Most routes require user authentication
 * 
 * @module UserRoutes
 * @requires express
 * @requires ../middleware/authentication
 * @requires ../controllers/userController
 */

/**
 * Route for retrieving all users
 * 
 * @route GET /api/v1/users
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @middleware authorizePermissions - Only admin can access all users
 */
router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

/**
 * Route for retrieving current user's details
 * 
 * @route GET /api/v1/users/showMe
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @returns {Object} Current user's profile information
 */
router.route("/showMe").get(authenticateUser, showCurrentUser);

/**
 * Route for updating user profile
 * 
 * @route PATCH /api/v1/users/updateUser
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @param {Object} req.body - Updated user profile details
 * @returns {Object} Updated user profile
 */
router.route("/updateUser").patch(authenticateUser, updateUser);

/**
 * Route for updating user password
 * 
 * @route PATCH /api/v1/users/updateUserPassword
 * 
 * @middleware authenticateUser - Ensures user is authenticated
 * @param {Object} req.body - New password details
 * @returns {Object} Password update confirmation
 */
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
  // This should be the last route, because it matches any route
  // For example:
  // // router.route("/:id").get(authenticateUser, getSingleUser);
  // // router.route("/showMe").get(authenticateUser, showCurrentUser);
  // When someone tries to access /showMe , express would match it to /:id first (with id = 'showMe') instead of matching the actual /showMe
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
