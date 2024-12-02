/**
 * @fileoverview Main application configuration file for the E-commerce API.
 * This file sets up the Express application, configures middleware, and defines routes.
 * The application implements security best practices and includes features like
 * rate limiting, CORS, XSS protection, and MongoDB sanitization.
 */

// By using express-async-errors, you can eliminate the need for explicit try-catch blocks or next(err) calls in async route handlers. The module automatically catches errors in async functions and forwards them to Express's error-handling middleware.
require("express-async-errors");

// Import required modules and routes
const express = require("express");
const app = express();
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connect");
const config = require("./utils/config");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productsRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Connect to MongoDB database
connectDB();

/**
 * Application Middleware Configuration
 * - trust proxy: Enable if app is behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
 * - express.static: Serve static files from the public directory
 * - express.json: Parse incoming JSON payloads
 * - cors: Enable Cross-Origin Resource Sharing
 * - helmet: Set security HTTP headers
 * - xss-clean: Sanitize user input
 * - mongoSanitize: Prevent MongoDB Operator Injection
 * - morgan: HTTP request logger
 * - cookieParser: Parse Cookie header and populate req.cookies
 * - rateLimiter: Limit repeated requests to public APIs
 */
app.set("trust proxy", 1);
app.use(express.static("./public"));
app.use(express.json());
app.use(cors());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
// Sign the cookies
app.use(cookieParser(config.JWT_SECRET));

/**
 * Application Routes
 * - authRouter: Authentication routes
 * - userRouter: User management routes
 * - productsRouter: Product management routes
 * - reviewRouter: Review management routes
 * - orderRouter: Order management routes
 */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

/**
 * Error Handling Middleware
 * - notFoundMiddleware: Handle 404 Not Found errors
 * - errorHandlerMiddleware: Handle application-wide errors
 */
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
