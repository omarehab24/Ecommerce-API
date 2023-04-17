const Review = require("../models/Review");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");
const { StatusCodes } = require("http-status-codes");

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

const getSingleReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    throw new CustomError.NotFoundError("Review not found!");
  }

  res.status(StatusCodes.OK).json({ review });
};

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
