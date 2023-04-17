const customError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
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
};

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
