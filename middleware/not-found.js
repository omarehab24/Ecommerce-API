/**
 * Middleware to handle requests to non-existent routes
 * 
 * This middleware is used as a catch-all for any routes
 * that are not defined in the application. It sends a
 * 404 Not Found response with a simple message.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} 404 response indicating route does not exist
 */
const notFound = (req, res) => res.status(404).send("Route does not exist");

module.exports = notFound;
