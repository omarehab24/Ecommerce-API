const express = require("express");
const router = express.Router();
const { 
  register, 
  testRegister, 
  login, 
  logout, 
  verifyEmail, 
  resetPassword, 
  forgotPassword, 
  testForgotPassword 
} = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

/**
 * Express router for authentication-related routes
 * 
 * This router handles various authentication and user management endpoints:
 * - User registration
 * - User login
 * - User logout
 * - Email verification
 * - Password reset and recovery
 * 
 * @module AuthRoutes
 * @requires express
 * @requires ../controllers/authController
 * @requires ../middleware/authentication
 */

/**
 * Route for user registration
 * @route POST /api/v1/auth/register
 * @param {Object} req.body - User registration details
 * @returns {Object} Created user information
 */
router.post("/register", register);

/**
 * Route for test user registration (likely for testing purposes)
 * @route POST /api/v1/auth/test-register
 * @param {Object} req.body - Test user registration details
 * @returns {Object} Created test user information
 */
router.post("/test-register", testRegister);

/**
 * Route for user login
 * @route POST /api/v1/auth/login
 * @param {Object} req.body - User login credentials
 * @returns {Object} User authentication token and details
 */
router.post("/login", login);

/**
 * Route for user logout
 * @route DELETE /api/v1/auth/logout
 * @middleware authenticateUser - Ensures user is authenticated before logout
 * @returns {Object} Logout confirmation
 */
router.delete("/logout", authenticateUser, logout);

/**
 * Route for email verification
 * @route GET /api/v1/auth/verify-email
 * @param {string} token - Email verification token
 * @returns {Object} Email verification status
 */
router.get("/verify-email", verifyEmail);

/**
 * Route for initiating password reset process
 * @route POST /api/v1/auth/forgot-password
 * @param {string} email - User's email address
 * @returns {Object} Password reset instructions
 */
router.post("/forgot-password", forgotPassword);

/**
 * Route for test forgot password functionality
 * @route POST /api/v1/auth/test-forgot-password
 * @param {string} email - Test user's email address
 * @returns {Object} Test password reset instructions
 */
router.post("/test-forgot-password", testForgotPassword);

/**
 * Route for resetting user password
 * @route POST /api/v1/auth/reset-password
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Object} Password reset confirmation
 */
router.post("/reset-password", resetPassword);

module.exports = router;
