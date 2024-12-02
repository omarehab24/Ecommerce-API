const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

/**
 * Custom error class for Not Found errors
 * 
 * Represents HTTP 404 Not Found errors, typically used when:
 * - Requested resource does not exist
 * - Specified route or endpoint is not available
 * - Database query returns no results
 * 
 * @class
 * @extends CustomAPIError
 */
class NotFoundError extends CustomAPIError {
  /**
   * Create a new NotFoundError
   * 
   * @param {string} message - Descriptive error message explaining what was not found
   */
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;
