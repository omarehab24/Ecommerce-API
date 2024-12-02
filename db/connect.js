const config = require("../utils/config");
const mongoose = require("mongoose");

// Suppress deprecation warnings for stricter Mongoose query behavior
mongoose.set("strictQuery", true);

/**
 * Establishes a connection to the MongoDB database
 * 
 * Connects to the database using the MongoDB URI from configuration.
 * Logs successful connection or any connection errors.
 * 
 * @function connectDB
 * @returns {void}
 * @throws {Error} Logs any connection errors to the console
 */
const connectDB = () => {
  mongoose.connect(config.MONGODB_URI)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((error) => {
      console.error("Database connection error:", error);
    });
};

module.exports = connectDB;
