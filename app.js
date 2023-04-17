require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productsRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Middleware
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
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
