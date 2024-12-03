/**
 * @fileoverview Test helper utilities for E-commerce API testing
 * This module provides utility functions and test data for integration testing
 * of the E-commerce API. It includes functions for database operations,
 * user authentication, and test data generation.
 */

const mongoose = require("mongoose")
const User = require("../models/User")
const Product = require("../models/Product")
const Token = require("../models/Token")
const Review = require("../models/Review")
const Order = require("../models/Order")

/**
 * Initial admin user data for testing
 * @constant {Object}
 */
const initialAdmin = {
  email: "admin@mail.com",
  name: "Superuser",
  password: "secret",
}

/**
 * Initial regular user data for testing
 * @constant {Object}
 */
const initialUser = {
  email: "testuser@mail.com",
  name: "Test User",
  password: "secret",
}

/**
 * Initial product data for testing
 * @constant {Object}
 */
const initialProduct = {
  name: "Test Product",
  price: 9.99,
  image: "test-image.jpg",
  colors: ["#ff0000", "#00ff00", "#0000ff"],
  company: "marcos",
  description: "This is a test product",
  category: "office",
}

/**
 * Initial review data for testing
 * @constant {Object}
 */
const initialReview = {
  rating: 5,
  comment: "This is a test review",
  product: null,
  user: null,
  title: "Test Review"
}

/**
 * Initial order data for testing
 * @constant {Object}
 */
const initialOrder = {
  tax: 399,
  shippingFee: 499,
  clientSecret: "RandomValue",
  subTotal: 3999,
  total: 4499,
  items: [
    {
      name: "accent chair",
      price: 2599,
      image: "https://dl.airtable.com/.attachmentThumbnails/e8bc3791196535af65f40e36993b9e1f/438bd160",
      amount: 3,
      product: null
    }
  ]
}

/**
 * Generates a non-existing MongoDB ObjectId
 * @async
 * @function nonExistingId
 * @returns {Promise<string>} A MongoDB ObjectId that doesn't exist in the database
 */
const nonExistingId = async () => {
  const product = new Product({ ...initialProduct, user: initialUser.id });
  await product.save();
  await product.deleteOne();

  return product._id.toString()
}

/**
 * Retrieves all users from the database
 * @async
 * @function usersInDb
 * @returns {Promise<Array>} Array of user objects from the database
 */
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

/**
 * Creates a test admin user in the database
 * @async
 * @function createTestAdmin
 * @returns {Promise<Object>} Created admin user object
 */
const createTestAdmin = async () => {
  // Check if this is the first account
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = "testtoken123";

  const user = new User({
    email: initialAdmin.email,
    name: initialAdmin.name,
    password: initialAdmin.password,
    role,
    verificationToken,
    isVerified: true
  });

  await user.save();
  return user;
}

/**
 * Creates a test regular user in the database
 * @async
 * @function createTestUser
 * @returns {Promise<Object>} Created user object
 */
const createTestUser = async () => {
  const user = new User({
    email: initialUser.email,
    name: initialUser.name,
    password: initialUser.password,
    role: "user",
    verificationToken: "testtoken456",
    isVerified: true
  });
  await user.save();
  return user;
}

/**
 * Creates another test user for multi-user testing scenarios
 * @async
 * @function createAnotherTestUser
 * @returns {Promise<Object>} Created user object
 */
const createAnotherTestUser = async () => {
  const user = new User({
    email: "anotheruser@mail.com",
    name: "Another User",
    password: "secret",
    role: "user",
    verificationToken: "testtoken789",
    isVerified: true
  });
  await user.save();
  return user;
}

/**
 * Creates a test product in the database
 * @async
 * @function createTestProduct
 * @param {string} adminId - ID of the admin user creating the product
 * @returns {Promise<Object>} Created product object
 */
const createTestProduct = async (adminId) => {
  await Product.deleteMany({});
  const product = new Product({ ...initialProduct, user: adminId});
  await product.save();
  return product;
}

/**
 * Creates a test review for a product
 * @async
 * @function createTestReview
 * @param {string} productId - ID of the product being reviewed
 * @param {string} userId - ID of the user creating the review
 * @returns {Promise<Object>} Created review object
 */
const createTestReview = async (productId, userId) => {
  const review = new Review({ ...initialReview, product: productId, user: userId });
  await review.save();
  return review;
}

/**
 * Creates a test order in the database
 * @async
 * @function createTestOrder
 * @param {string} userId - ID of the user placing the order
 * @param {string} productId - ID of the product being ordered
 * @returns {Promise<Object>} Created order object
 */
const createTestOrder = async (userId, productId) => {
  const product = await Product.findById(productId);
  const orderItems = [{
    name: product.name,
    price: product.price,
    image: product.image,
    amount: 3,
    product: productId
  }];
  
  const subTotal = orderItems[0].price * orderItems[0].amount;
  const order = new Order({
    tax: 399,
    shippingFee: 499,
    subTotal,
    total: subTotal + 399 + 499,
    orderItems,
    status: 'pending',
    clientSecret: 'RandomValue',
    user: userId
  });
  
  await order.save();
  
  return order;
}

/**
 * Extracts authentication token from cookie header
 * @function extractTokenFromCookie
 * @param {string} cookie - Cookie header string
 * @returns {string} Extracted token
 */
const extractTokenFromCookie = (cookie) => {
  if (!cookie) return null;
  return cookie
    .split(';')[0] // Get first part before ;
    .replace('accessToken=', '') // Remove prefix
}

/**
 * Generates a password reset token
 * @async
 * @function resetPasswordToken
 * @param {Object} api - Supertest API instance
 * @returns {Promise<string>} Password reset token
 */
const resetPasswordToken = async (api) => {
  await api
    .post('/api/v1/auth/test-forgot-password')
    .set('User-Agent', 'test-agent')
    .set('X-Forwarded-For', '127.0.0.1')
    .send({
      email: initialAdmin.email
    });
  
  const updatedUser = await User.findOne({ email: initialAdmin.email });
  return updatedUser.passwordToken;
}

/**
 * Authenticates a user and returns login response
 * @async
 * @function loginUser
 * @param {Object} api - Supertest API instance
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response object
 */
const loginUser = async (api, email, password) => {
  try {
    const response = await api
      .post("/api/v1/auth/login")
      .set('User-Agent', 'test-agent')  
      .set('X-Forwarded-For', '127.0.0.1')  
      .send({
        email,
        password
      });

    // console.log('Login Response Status:', response.status);
    // console.log('Login Response Body:', response.body);
    // console.log('Login Response Headers:', response.headers);

    const cookies = response.headers['set-cookie'];
    if (!cookies) {
      console.log('No cookies in response headers');
      return null;
    }

    // console.log('Cookies from response:', cookies);
    const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));
    
    if (!accessTokenCookie) {
      console.log('No access token cookie found in:', cookies);
      return null;
    }

    const token = extractTokenFromCookie(accessTokenCookie);
    // console.log('Extracted token:', token);
    return token;

  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

/**
 * Clears all collections in the test database
 * @async
 * @function clearDB
 */
const clearDB = async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Token.deleteMany({});
  await Review.deleteMany({});
  await Order.deleteMany({});
}

/**
 * Sets up test database with admin user
 * @async
 * @function setupTestDbAdmin
 * @param {Object} api - Supertest API instance
 * @returns {Promise<Object>} Setup result object
 */
const setupTestDbAdmin = async (api) => {
  await clearDB();

  // Create admin user (first user)
  const admin = await createTestAdmin();

  // Login admin to get token
  const adminAccessToken = await loginUser(api, initialAdmin.email, initialAdmin.password);

  return { admin, adminAccessToken };
}

/**
 * Sets up test database with regular user
 * @async
 * @function setupTestDbUser
 * @param {Object} api - Supertest API instance
 * @returns {Promise<Object>} Setup result object
 */
const setupTestDbUser = async (api) => {

  const user = await createTestUser();

  const userAccessToken = await loginUser(api, initialUser.email, initialUser.password);

  return { user, userAccessToken };
}

/**
 * Sets up test database with another test user
 * @async
 * @function setupAnotherTestDbUser
 * @param {Object} api - Supertest API instance
 * @returns {Promise<Object>} Setup result object
 */
const setupAnotherTestDbUser = async (api) => {

  const user = await createAnotherTestUser();

  const userAccessToken = await loginUser(api, "anotheruser@mail.com", "secret");

  return { user, userAccessToken };
}

/**
 * Closes the database connection
 * @async
 * @function closeDbConnection
 */
const closeDbConnection = async () => {
  await mongoose.connection.close()
}

/**
 * Export all test helper functions and data
 * @constant {Object} userHelpers
 */
const userHelpers = {
  initialAdmin,
  initialUser,
  initialProduct,
  createTestProduct,
  createTestOrder,
  usersInDb,
  loginUser,
  extractTokenFromCookie,
  resetPasswordToken,
  createTestReview,
  nonExistingId,
}

/**
 * Export all database helper functions
 * @constant {Object} dbHelpers
 */
const dbHelpers = {
  closeDbConnection,
  setupTestDbAdmin,
  setupTestDbUser,
  setupAnotherTestDbUser,
}

module.exports = {
  ...userHelpers,
  ...dbHelpers
}