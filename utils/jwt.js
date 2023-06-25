const jwt = require("jsonwebtoken");

// Accept object as a function parameter, to send arguments without the need for ordering
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, userObj, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { userObj } });
  const refreshTokenJWT = createJWT({ payload: { userObj, refreshToken } });

  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000,
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
};

/* const attachSingleCookieToResponse = ({ res, userObj }) => {
  const token = createJWT({ payload: userObj });

  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("token", token, {
    expires: new Date(Date.now() + oneDay),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
}; */

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
