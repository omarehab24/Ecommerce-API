const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

/**
 * Mongoose schema for User model
 * 
 * Represents a user in the e-commerce system with authentication
 * and verification capabilities.
 * 
 * @typedef {Object} User
 * @property {string} name - User's full name (3-50 characters)
 * @property {string} email - Unique user email address
 * @property {string} password - Hashed user password
 * @property {string} [role='user'] - User role (admin or user)
 * @property {string} [verificationToken] - Token for email verification
 * @property {boolean} [isVerified=false] - Email verification status
 * @property {Date} [verified] - Date of email verification
 * @property {string} [passwordToken] - Token for password reset
 * @property {Date} [passwordTokenExpirationDate] - Expiration of password reset token
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name!"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email!"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minLength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: Date,
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
});

/**
 * Pre-save middleware to hash user passwords
 * 
 * Automatically hashes the user's password before saving
 * to the database using bcrypt, with a salt round of 10.
 * Only hashes the password if it has been modified.
 */
// Encryting Passwords before the document is saved
// Must use 'function()' syntax to utilize 'this' pointer
// 'this' points to userSchema
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

/**
 * Compares a candidate password with the stored hashed password
 * 
 * Uses bcrypt to compare the provided password with the
 * stored hashed password for authentication.
 * 
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Whether the password is correct
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

/**
 * Transform function to modify the returned JSON object
 * 
 * Removes sensitive information and converts _id to a string
 * to improve API response readability and security.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
userSchema.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.verificationToken;
    delete returnedObject.passwordToken;
  }
});

/**
 * Transform function for toObject method
 * 
 * Ensures consistent object representation when converting
 * Mongoose documents to plain JavaScript objects, removing
 * sensitive information.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
userSchema.set('toObject', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.verificationToken;
    delete returnedObject.passwordToken;
  }
});

/**
 * User model representing users in the e-commerce system
 * 
 * Provides an interface for creating, querying, and managing
 * user accounts with authentication and role-based access.
 * 
 * @type {mongoose.Model}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
