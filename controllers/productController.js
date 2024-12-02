/**
 * @fileoverview Product Controller
 * Handles all product-related operations including creating, reading,
 * updating, and deleting products, as well as image upload functionality.
 * 
 * This controller implements features including:
 * - CRUD operations for products
 * - Image upload and validation
 * - Product reviews population
 * - User-specific product creation
 */

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");
const path = require("path");

/**
 * Create a new product
 * @async
 * @function createProduct
 * @param {Object} req - Express request object
 * @param {Object} req.body - Product data
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.user.userID - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns created product
 */
const createProduct = async (req, res) => {
  req.body.user = req.user.userID;

  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};

/**
 * Retrieve all products
 * @async
 * @function getAllProducts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns array of products and count
 */
const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

/**
 * Retrieve a single product by ID
 * @async
 * @function getSingleProduct
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns product with populated reviews
 * @throws {CustomError.NotFoundError} - If product not found
 */
const getSingleProduct = async (req, res) => {
  // Note: "reviews" can't be queried, because it's a virtual
  const { id: productID } = req.params;
  const product = await Product.findOne({ _id: productID }).populate("reviews");

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  res.status(StatusCodes.OK).json({ product });
};

/**
 * Update a product
 * @async
 * @function updateProduct
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} req.body - Updated product data
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns updated product
 * @throws {CustomError.NotFoundError} - If product not found
 */
const updateProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOneAndUpdate(
    { _id: productID },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  res.status(StatusCodes.OK).json({ product });
};

/**
 * Delete a product
 * @async
 * @function deleteProduct
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Product ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message
 * @throws {CustomError.NotFoundError} - If product not found
 */
const deleteProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOne({ _id: productID });

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  // Triggers the pre hook
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Product deleted successfully!" });
};

/**
 * Upload product image
 * @async
 * @function uploadImage
 * @param {Object} req - Express request object
 * @param {Object} req.files - Uploaded files
 * @param {Object} req.files.myImage - Product image file
 * @param {Object} res - Express response object
 * @returns {Promise<void>} - Returns success message with image path
 * @throws {CustomError.BadRequestError} - If no image uploaded
 * @throws {CustomError.BadRequestError} - If invalid image format
 */
const uploadImage = async (req, res) => {
  // console.log(req.files);

  if (!req.files) {
    throw new CustomError.BadRequestError("Error! No file uploaded!");
  }

  const productImage = req.files.myImage;

  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Error! Please upload an image!");
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError("Error! Size mustn't exceed 1 MB");
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/",
    productImage.name
  );

  await productImage.mv(imagePath);

  res
    .status(StatusCodes.CREATED)
    .json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
