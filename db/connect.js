const mongoose = require("mongoose");

// To suppress deprecation warnings
mongoose.set("strictQuery", true);

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
