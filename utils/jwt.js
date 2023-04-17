const jwt = require("jsonwebtoken");

// Accept object as a function parameter, to send arguments without the need for ordering
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, userObj }) => {
  const token = createJWT({ payload: userObj });

  const oneDay = 24 * 60 * 60 * 1000;

  res.cookie("token", token, {
    expires: new Date(Date.now() + oneDay),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
