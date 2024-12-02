const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

/**
 * Express router for review-related routes
 * 
 * This router handles various review management endpoints:
 * - Create new reviews
 * - Retrieve reviews (all, single review)
 * - Update and delete reviews
 * 
 * Most routes require user authentication
 * 
 * @module ReviewRoutes
 * @requires express
 * @requires ../middleware/authentication
 * @requires ../controllers/reviewController
 */

/**
 * Routes for retrieving all reviews and creating a new review
 * 
 * @route GET /api/v1/reviews
 * @route POST /api/v1/reviews
 * 
 * @middleware authenticateUser - Required for creating a review
 */
router.route("/").get(getAllReviews).post(authenticateUser, createReview);

/**
 * Routes for retrieving, updating, and deleting a specific review
 * 
 * @route GET /api/v1/reviews/:id
 * @route PATCH /api/v1/reviews/:id
 * @route DELETE /api/v1/reviews/:id
 * 
 * @param {string} id - Review identifier
 * 
 * @middleware authenticateUser - Required for updating or deleting a review
 */
router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

module.exports = router;
