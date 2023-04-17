const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const Product = require("../models/Product");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userID;

  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  // Note: "reviews" can't be queried, because it's a virtual
  const product = await Product.findOne({ _id: req.params.id }).populate(
    "reviews"
  );

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productID } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });

  if (!product) {
    throw new CustomError.NotFoundError("Product not found!");
  }

  // Triggers the pre hook
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Product removed!" });
};

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
