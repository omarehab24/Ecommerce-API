/**
 * Centralized error handling module for the API
 * 
 * Exports custom error classes to provide consistent
 * and meaningful error responses across the application.
 * 
 * Includes error types for:
 * - Custom API errors
 * - Authentication errors
 * - Authorization errors
 * - Not found errors
 * - Bad request errors
 * 
 * @module Errors
 */

const CustomAPIError = require("./custom-api");
const UnauthenticatedError = require("./unauthenticated");
const NotFoundError = require("./not-found");
const BadRequestError = require("./bad-request");
const UnauthorizedError = require("./unauthorized");

/**
 * Exported error classes for use throughout the application
 * 
 * @type {Object}
 * @property {CustomAPIError} CustomAPIError - Base custom API error
 * @property {UnauthenticatedError} UnauthenticatedError - Authentication failure error
 * @property {NotFoundError} NotFoundError - Resource not found error
 * @property {BadRequestError} BadRequestError - Invalid request error
 * @property {UnauthorizedError} UnauthorizedError - Insufficient permissions error
 */
module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
};
