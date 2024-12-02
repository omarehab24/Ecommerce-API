/**
 * @fileoverview Server entry point for the E-commerce API
 * This file initializes the Express server and starts listening for incoming requests.
 * The server configuration is loaded from the config utility module.
 * 
 * The actual Express application setup and middleware configuration
 * is handled in app.js to maintain separation of concerns.
 */

const app = require("./app");
const config = require("./utils/config");

/**
 * Start the server and listen for incoming connections
 * The port number is configured in the environment variables
 * and accessed through the config utility
 */
app.listen(config.PORT, () =>
  console.log(`Listening on port ${config.PORT}...`)
);