/**
 * @fileoverview User Controller
 * Handles all user-related operations including user management,
 * profile updates, and password changes.
 * 
 * This controller implements features including:
 * - User CRUD operations
 * - Role-based access control
 * - Password management
 * - User profile management
 */

const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} = require("../utils");

/**
 * Retrieve all users (admin only, excludes admin users)
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of users (excluding passwords)
 */
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

/**
 * Retrieve a single user by ID
 * @async
 * @function getSingleUser
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns user data (excluding password)
 * @throws {CustomError.NotFoundError} - If user not found
 * @throws {CustomError.UnauthorizedError} - If user not authorized
 */
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError("User not found!");
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

/**
 * Get current authenticated user's profile
 * @async
 * @function showCurrentUser
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns current user's profile
 */
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

/**
 * Update user profile
 * @async
 * @function updateUser
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user data
 * @param {Object} req.body - Updated user data
 * @param {string} req.body.name - Updated name
 * @param {string} req.body.email - Updated email
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns updated user profile
 * @throws {CustomError.BadRequestError} - If name or email missing
 */
const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "Please provide the requried values!"
    );
  }

  const user = await User.findOne({ _id: req.user.userID });

  user.name = name;
  user.email = email;

  await user.save();

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, userObj: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// update user with findOneAndUpdate
/* const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "Please provide the requried values!"
    );
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.userID },
    { name, email },
    { new: true, runValidators: true }
  );

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({res, userObj: tokenUser})

  res.status(StatusCodes.OK).json({user: tokenUser})
}; */

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide both oldPassword and newPassword!"
    );
  }

  const user = await User.findOne({ _id: req.user.userID });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials!");
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
