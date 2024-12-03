const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

/**
 * Custom error class for Unauthorized errors
 * 
 * Represents HTTP 403 Forbidden errors, typically used when:
 * - User is authenticated but lacks required permissions
 * - User attempts to access a resource they are not allowed to
 * - Role-based access control prevents action
 * 
 * @class
 * @extends CustomAPIError
 */
class UnauthorizedError extends CustomAPIError {
  /**
   * Create a new UnauthorizedError
   * 
   * @param {string} message - Descriptive error message explaining permission denial
   */
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
