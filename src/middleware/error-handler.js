const { StatusCodes } = require("http-status-codes");

/**
 * Global error handling middleware for the Express application
 * 
 * This middleware handles various types of errors and provides
 * consistent error responses:
 * 1. Handles Mongoose validation errors
 * 2. Handles duplicate key errors
 * 3. Handles MongoDB cast errors
 * 4. Provides default error handling for unspecified errors
 * 
 * @param {Error} err - The error object thrown during request processing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with error status code and message
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customError.statusCode = 400;
  }

  // Handle duplicate key errors (e.g., unique constraint violation)
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }

  // Handle MongoDB cast errors (invalid ID format)
  if (err.name === "CastError") {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
