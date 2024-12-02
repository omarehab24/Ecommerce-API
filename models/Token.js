const mongoose = require("mongoose");

/**
 * Mongoose schema for Token model
 * 
 * Represents a refresh token in the authentication system,
 * storing token details and associated user information.
 * 
 * @typedef {Object} Token
 * @property {string} refreshToken - Refresh token string
 * @property {string} ip - IP address of token creation
 * @property {string} userAgent - User agent of token creation
 * @property {boolean} [isValid=true] - Token validity status
 * @property {mongoose.Types.ObjectId} user - Reference to the User model
 * @property {Date} createdAt - Timestamp of token creation
 * @property {Date} updatedAt - Timestamp of last token update
 */
const tokenSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Transform function to modify the returned JSON object
 * 
 * Removes the version key and converts _id to a string
 * to improve API response readability.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
tokenSchema.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject.refreshToken; // Prevent token exposure
  }
});

/**
 * Transform function for toObject method
 * 
 * Ensures consistent object representation when converting
 * Mongoose documents to plain JavaScript objects.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
tokenSchema.set('toObject', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject.refreshToken; // Prevent token exposure
  }
});

/**
 * Token model representing authentication refresh tokens
 * 
 * Provides an interface for creating, querying, and managing
 * refresh tokens in the authentication system.
 * 
 * @type {mongoose.Model}
 */
module.exports = mongoose.model("Token", tokenSchema)