/**
 * @fileoverview Authentication Controller
 * Handles all authentication-related operations including user registration,
 * login, logout, email verification, and password reset functionality.
 * 
 * This controller implements security best practices including:
 * - Email verification
 * - Secure password reset flow
 * - JWT-based authentication with cookies
 * - Role-based access control
 */

const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash
} = require("../utils");
const crypto = require("crypto");
const config = require("../utils/config");
const origin = config.ORIGIN;

/**
 * Register a new user
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.name - User's name
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns created user with verification email sent
 * @throws {CustomError.BadRequestError} - If email already exists
 */
const register = async (req, res) => {
  // Used unique in user model instead
  /*     const {email} = req.body
    const emailAlreadyExists = await User.findOne({email})
    if(emailAlreadyExists){
        throw new CustomError.BadRequestError("Email already exists!")
    } */

  const { email, name, password } = req.body;

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken,
  });

  //    // Create a user token object with specific user info
  // const tokenUser = createTokenUser(user);

  // // const token = createJWT({ payload: tokenUser });
  // attachCookiesToResponse({ res, userObj: tokenUser });

  // // Send tokenUser object instead of the whole user object
  // res.status(StatusCodes.CREATED).json({ user: tokenUser });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  // Send verification token back, only while testing in postman
  res.status(StatusCodes.CREATED).json({
    msg: "Success! please check your email to verify your account!",
  });
};

/**
 * Test registration endpoint for development
 * @async
 * @function testRegister
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns created user with auth token
 */
const testRegister = async (req, res) => {

  const { email, name, password } = req.body;

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    email,
    name,
    password,
    role,
    verificationToken,
  });

     // Create a user token object with specific user info
  const tokenUser = createTokenUser(user);
  
  // const token = createJWT({ payload: tokenUser });
  attachCookiesToResponse({ res, userObj: tokenUser });

  // Send tokenUser object instead of the whole user object
  res.status(StatusCodes.CREATED).json({ user: tokenUser });

};

/**
 * Authenticate user and create session
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns user data and sets authentication cookie
 * @throws {CustomError.UnauthenticatedError} - If invalid credentials
 * @throws {CustomError.UnauthenticatedError} - If email not verified
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password!");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError(
      "Please provide a correct email and password!"
    );
  }

  // Using comparePassword() in the user instance of the User model
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(
      "Please provide a correct email and password!"
    );
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError(
      "Account is not verified, please verify your account!"
    );
  }

  const tokenUser = createTokenUser(user);

  // When user has already logged in before
  let refreshToken = "";
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials!");
    }

    refreshToken = existingToken.refreshToken;

    attachCookiesToResponse({ res, userObj: tokenUser, refreshToken });

    // console.log(req.signedCookies);
    // console.log(req.cookies);

    res.status(StatusCodes.OK).json({ user: tokenUser });

    return;
  }

  // When user is logging in for the first time
  refreshToken = crypto.randomBytes(40).toString("hex");

  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };

  await Token.create(userToken);
  
  attachCookiesToResponse({ res, userObj: tokenUser, refreshToken });

  // console.log(req.signedCookies);
  // console.log(req.cookies);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

/**
 * End user session and clear authentication cookie
 * @async
 * @function logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message
 */
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userID });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "User logged out!" });
};

/**
 * Verify user's email address
 * @async
 * @function verifyEmail
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.token - Verification token
 * @param {string} req.query.email - User's email
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns verification success message
 * @throws {CustomError.UnauthenticatedError} - If invalid verification credentials
 */
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.query;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification faild!");
  }

  if (verificationToken !== user.verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification faild!");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email verified!" });
};

/**
 * Initiate password reset process
 * @async
 * @function forgotPassword
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message and sends reset email
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide a valid email!");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email to reset your password!" });
};

/**
 * Test endpoint for password reset flow
 * @async
 * @function testForgotPassword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns password reset token
 */
const testForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide a valid email!");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email to reset your password!" });
};

/**
 * Reset user's password using reset token
 * @async
 * @function resetPassword
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.token - Password reset token
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - New password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message
 * @throws {CustomError.UnauthenticatedError} - If invalid reset token
 */
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token) {
    throw new CustomError.UnauthorizedError("Unauthenticated!");
  }

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide all values!");
  }

  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: "Password successfully reset!" });
};

module.exports = {
  register,
  testRegister,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  testForgotPassword,
  resetPassword,
};
