const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const user = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ user });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError("User not found!");
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with user.save
const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "Please provide the requried values!"
    );
  }

  const user = await User.findOne({ _id: req.user.userID });

  user.name = name;
  user.email = email;

  await user.save();

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, userObj: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// update user with findOneAndUpdate
/* const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError(
      "Please provide the requried values!"
    );
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.userID },
    { name, email },
    { new: true, runValidators: true }
  );

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({res, userObj: tokenUser})

  res.status(StatusCodes.OK).json({user: tokenUser})
}; */

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide both oldPassword and newPassword!"
    );
  }

  const user = await User.findOne({ _id: req.user.userID });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials!");
  }

  user.password = newPassword;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated!" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
