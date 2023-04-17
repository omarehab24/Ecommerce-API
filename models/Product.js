const mongoose = require("mongoose");

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
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: {rating: 5},
});

productSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", productSchema);
