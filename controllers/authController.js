const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const crypto = require("crypto");

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

  /*   // Create a user token object with specific user info
  const tokenUser = createTokenUser(user);

  // const token = createJWT({ payload: tokenUser });
  attachCookiesToResponse({ res, userObj: tokenUser });

  // Send tokenUser object instead of the whole user object
  res.status(StatusCodes.CREATED).json({ user: tokenUser }); */

  // Send verification token back, only while testing in postman
  res.status(StatusCodes.CREATED).json({
    msg: "Success! please check your email to verify your account!",
    verificationToken: user.verificationToken,
  });
};

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

  attachCookiesToResponse({ res, userObj: tokenUser });

  // console.log(req.signedCookies);
  // console.log(req.cookies);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 0 * 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "logout user" });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification faild!");
  }

  if(verificationToken !== user.verificationToken){
    throw new CustomError.UnauthenticatedError("Verification faild!");
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ""

  await user.save()

  res.status(StatusCodes.OK).json({msg:"Email verified!"});
};

module.exports = { register, login, logout, verifyEmail };
