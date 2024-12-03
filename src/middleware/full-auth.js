const CustomError = require("../errors");
const { isTokenValid } = require("../utils/jwt");

/**
 * Middleware to authenticate user from different token sources
 * 
 * This middleware handles token authentication by:
 * 1. Checking for token in Authorization header (Bearer token)
 * 2. Checking for token in cookies
 * 3. Validating the token
 * 4. Attaching user information to the request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {UnauthenticatedError} If no token is found or token is invalid
 */
const authenticateUser = async (req, res, next) => {
  let token;
  // check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }
  // check cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const payload = isTokenValid(token);

    // Attach the user and his permissions to the req object
    req.user = {
      userId: payload.user.userId,
      role: payload.user.role,
    };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

/**
 * Middleware to authorize user roles for specific routes
 * 
 * Creates a middleware function that checks if the user's role
 * is included in the allowed roles for a specific route
 * 
 * @param {...string} roles - List of roles allowed to access the route
 * @returns {Function} Express middleware function for role-based authorization
 * @throws {UnauthorizedError} If user's role is not in the allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
