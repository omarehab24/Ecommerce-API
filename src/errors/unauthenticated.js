const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

/**
 * Custom error class for Unauthenticated errors
 * 
 * Represents HTTP 401 Unauthorized errors, typically used when:
 * - User is not authenticated
 * - Invalid or expired authentication token
 * - Missing authentication credentials
 * 
 * @class
 * @extends CustomAPIError
 */
class UnauthenticatedError extends CustomAPIError {
  /**
   * Create a new UnauthenticatedError
   * 
   * @param {string} message - Descriptive error message explaining authentication failure
   */
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;
