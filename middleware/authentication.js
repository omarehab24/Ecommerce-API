const customError = require("../errors");
const { isTokenValid } = require("../utils");
const Token = require("../models/Token");
const { attachCookiesToResponse } = require("../utils");

/**
 * Middleware to authenticate user based on access and refresh tokens
 * 
 * This middleware handles token validation and user authentication:
 * 1. Checks for an access token in signed cookies
 * 2. If no access token, validates the refresh token
 * 3. Verifies token against stored token in database
 * 4. Attaches user information to the request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {UnauthenticatedError} If token is invalid or not found
 */
const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.userObj;
      return next();
    }

    const payload = isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: payload.userObj.userID,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new customError.UnauthenticatedError("Authentication invalid");
    }

    attachCookiesToResponse({
      res,
      userObj: payload.userObj,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.userObj;

    next();
  } catch (error) {
    throw new customError.UnauthenticatedError("Authentication invalid");
  }
};
/* const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new customError.UnauthenticatedError("Authentication invalid");
  }

  try {
    const payload = isTokenValid({ token });
    req.user = {
      name: payload.name,
      userID: payload.userID,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new customError.UnauthenticatedError("Authentication invalid");
  }
}; */

// Return a function as callback for express to use as middleware in userRoutes.js
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new customError.UnauthorizedError("Unauthorized!");
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
