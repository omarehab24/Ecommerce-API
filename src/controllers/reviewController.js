/**
 * @fileoverview Review Controller
 * Handles all review-related operations including creating, reading,
 * updating, and deleting product reviews.
 * 
 * This controller implements features including:
 * - CRUD operations for reviews
 * - Product-specific review management
 * - User permission validation
 * - Prevention of duplicate reviews
 */

const Review = require("../models/Review");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const { StatusCodes } = require("http-status-codes");

/**
 * Create a new product review
 * @async
 * @function createReview
 * @param {Object} req - Express request object
 * @param {Object} req.body - Review data
 * @param {string} req.body.product - Product ID
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.user.userID - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns created review
 * @throws {CustomError.NotFoundError} - If product not found
 * @throws {CustomError.BadRequestError} - If user already submitted a review
 */
const createReview = async (req, res) => {
  const { product: productID } = req.body;
  const { userID } = req.user;
  
  const isProductValid = await Product.findOne({ _id: productID });

  if (!isProductValid) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  const alreadySubmittedReview = await Review.findOne({
    product: productID,
    user: userID,
  });

  if (alreadySubmittedReview) {
    throw new CustomError.BadRequestError("Already submitted review!");
  }

  req.body.user = userID;

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};

/**
 * Retrieve all reviews
 * @async
 * @function getAllReviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of reviews with populated user and product data
 */
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

/**
 * Retrieve a single review by ID
 * @async
 * @function getSingleReview
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns review with populated user and product data
 * @throws {CustomError.NotFoundError} - If review not found
 */
const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    throw new CustomError.NotFoundError("Review not found!");
  }

  res.status(StatusCodes.OK).json({ review });
};

/**
 * Update a review
 * @async
 * @function updateReview
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} req.body - Updated review data
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns updated review
 * @throws {CustomError.NotFoundError} - If review not found
 * @throws {CustomError.UnauthorizedError} - If user not authorized
 */
const updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    throw new CustomError.NotFoundError("Review not found!");
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  // Triggers the post hook
  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

/**
 * Delete a review
 * @async
 * @function deleteReview
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Review ID
 * @param {Object} req.user - Authenticated user data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message
 * @throws {CustomError.NotFoundError} - If review not found
 * @throws {CustomError.UnauthorizedError} - If user not authorized
 */
const deleteReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    throw new CustomError.NotFoundError("Review not found!");
  }

  checkPermissions(req.user, review.user);

  // Triggers the post hook
  await review.remove();

  res.status(StatusCodes.OK).json({ msg: "Review deleted successfully!" });
};

/**
 * Get all reviews for a specific product
 * @async
 * @function getSingleProductReviews
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of reviews for the product
 */
const getSingleProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.id });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
