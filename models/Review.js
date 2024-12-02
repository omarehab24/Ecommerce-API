const mongoose = require("mongoose");

/**
 * Mongoose schema for Review model
 * 
 * Represents a product review in the e-commerce system,
 * capturing user feedback, ratings, and associated metadata.
 * 
 * @typedef {Object} Review
 * @property {number} rating - Product rating (1-5)
 * @property {string} title - Review title (max 100 characters)
 * @property {string} comment - Detailed review text
 * @property {mongoose.Schema.ObjectId} user - Reference to the User model
 * @property {mongoose.Schema.ObjectId} product - Reference to the Product model
 * @property {Date} createdAt - Timestamp of review creation
 * @property {Date} updatedAt - Timestamp of last review update
 */
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating!"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      required: [true, "Please provide review title!"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review text!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Unique index to prevent multiple reviews from the same user for a product
 * 
 * Ensures that a user can only submit one review per product.
 */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Static method to calculate average rating for a product
 * 
 * Aggregates all reviews for a specific product and computes
 * the average rating, which can be used to update product statistics.
 * 
 * @param {mongoose.Schema.ObjectId} productID - ID of the product to calculate rating for
 * @returns {Promise<number>} Average rating for the product
 */
reviewSchema.statics.calculateAverageRating = async function (productID) {
  const result = await this.aggregate([
    {
      $match: {
        product: productID,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productID },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

/**
 * Post-save middleware to update product's average rating
 * 
 * Triggers the calculateAverageRating method after a review is saved
 * to keep the associated product's rating statistics up to date.
 */
reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

/**
 * Post-remove middleware to update product's average rating
 * 
 * Triggers the calculateAverageRating method after a review is removed
 * to maintain accurate product rating statistics.
 */
reviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

/**
 * Transform function to modify the returned JSON object
 * 
 * Removes the version key and converts _id to a string
 * to improve API response readability.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
reviewSchema.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
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
reviewSchema.set('toObject', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
  }
});

/**
 * Review model representing product reviews in the e-commerce store
 * 
 * Provides an interface for creating, querying, and managing
 * product reviews in the application.
 * 
 * @type {mongoose.Model}
 */
module.exports = mongoose.model("Review", reviewSchema);
