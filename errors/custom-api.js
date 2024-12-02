/**
 * Base custom error class for API-specific errors
 * 
 * Provides a standardized way to create custom error types
 * with consistent error handling across the application.
 * 
 * @class
 * @extends Error
 */
class CustomAPIError extends Error {
  /**
   * Create a new CustomAPIError
   * 
   * @param {string} message - Descriptive error message
   */
  constructor(message) {
    super(message);
  }
}

module.exports = CustomAPIError;
