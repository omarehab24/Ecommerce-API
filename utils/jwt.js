const jwt = require("jsonwebtoken");

/**
 * Creates a JWT (JSON Web Token) for user authentication
 * 
 * Generates a signed token with user payload and specified expiration.
 * Used for maintaining user sessions and authentication.
 * 
 * @function createJWT
 * @param {Object} payload - User information to be encoded in the token
 * @returns {string} A signed JWT token
 * 
 * @throws {Error} If token generation fails
 * 
 * @example
 * const token = createJWT({ userID: '123', name: 'John' })
 */
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

/**
 * Verifies the validity of a JWT token
 * 
 * Decodes and validates a JWT token against the secret key.
 * 
 * @function isTokenValid
 * @param {string} token - The JWT token to verify
 * @returns {Object} Decoded token payload if valid
 * 
 * @throws {Error} If token is invalid or expired
 * 
 * @example
 * const decodedPayload = isTokenValid(userToken)
 */
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

/**
 * Attaches JWT cookies to the response object
 * 
 * Sets HTTP-only cookies for access and refresh tokens.
 * 
 * @function attachCookiesToResponse
 * @param {Object} options - Options for attaching cookies
 * @param {Object} options.res - Response object
 * @param {Object} options.userObj - User object
 * @param {string} options.refreshToken - Refresh token
 * 
 * @example
 * attachCookiesToResponse({ res, userObj, refreshToken })
 */
const attachCookiesToResponse = ({ res, userObj, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { userObj } });
  const refreshTokenJWT = createJWT({ payload: { userObj, refreshToken } });

  const oneDay = 24 * 60 * 60 * 1000;
  const longerExpiration = oneDay * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerExpiration),
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
