const mongoose = require("mongoose");

/**
 * Mongoose schema for Product model
 * 
 * Represents a product in the e-commerce system with comprehensive
 * details including name, price, description, and product attributes.
 * 
 * @typedef {Object} Product
 * @property {string} name - Product name (max 100 characters)
 * @property {number} price - Product price
 * @property {string} description - Product description (max 1000 characters)
 * @property {string} [image="/uploads/example.jpeg"] - Product image URL
 * @property {string} category - Product category (office, kitchen, bedroom)
 * @property {string} company - Product manufacturer (ikea, liddy, marcos)
 * @property {string[]} colors - Available product colors
 * @property {boolean} [featured=false] - Whether product is featured
 * @property {boolean} [freeShipping=false] - Whether product has free shipping
 * @property {number} inventory - Number of items in stock
 * @property {number} averageRating - Average product rating
 * @property {number} numOfReviews - Total number of product reviews
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide a product name!"],
      maxlength: [100, "Name can't exceed 100 characters!"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price!"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description!"],
      maxlength: [1000, "Description can't exceed 1000 characters!"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please provide a product category!"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide a product company!"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported!",
      },
    },
    colors: {
      type: [String],
      default: ["222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "id",
  foreignField: "product",
  justOne: false,
  // match: {rating: 5},
});

/**
 * Pre-remove middleware to delete associated reviews
 * 
 * Ensures that all reviews associated with a product are deleted
 * when the product is removed.
 */
productSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this.id });
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
productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // delete returnedObject.user
  }
})

/**
 * Transform function for toObject method
 * 
 * Ensures consistent object representation when converting
 * Mongoose documents to plain JavaScript objects.
 * 
 * @param {Object} document - Mongoose document
 * @param {Object} returnedObject - Object to be returned
 */
productSchema.set('toObject', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // delete returnedObject.user
  }
})

/**
 * Product model representing items available in the e-commerce store
 * 
 * Provides an interface for creating, querying, and managing
 * products in the application.
 * 
 * @type {mongoose.Model}
 */
module.exports = mongoose.model("Product", productSchema);
