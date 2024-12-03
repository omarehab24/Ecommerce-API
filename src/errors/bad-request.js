const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

/**
 * Custom error class for Bad Request errors
 * 
 * Represents HTTP 400 Bad Request errors, typically used when:
 * - Client sends invalid or malformed request data
 * - Request cannot be processed due to client-side issues
 * 
 * @class
 * @extends CustomAPIError
 */
class BadRequestError extends CustomAPIError {
  /**
   * Create a new BadRequestError
   * 
   * @param {string} message - Descriptive error message explaining the bad request
   */
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
