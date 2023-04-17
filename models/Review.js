const mongoose = require("mongoose");

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

// One product review per one user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Call user defined method "calculateAverageRating" on the schema itself
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

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
