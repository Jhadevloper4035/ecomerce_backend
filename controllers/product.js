const mongoose = require("mongoose");
const slugify = require("slugify");
const Product = require("../models/product.model.js");
const client = require("../config/redis.js");
const User = require("../models/user.model.js");

const createProduct = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    const product = new Product({ ...req.body, slug });
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 3;

    const cachedKey = `product:page:${page}`;

    const cachedProducts = await client.get(cachedKey);

    if (cachedProducts) {
      return res
        .status(200)
        .json({
          message: "Product fetched successfully from cached Products",
          products: JSON.parse(cachedProducts),
        });
    }

    const products = await Product.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({ path: "rating.postedBy", select: "name , email " })
      .sort({ createdAt: -1 });

    await client.set(cachedKey, JSON.stringify(products), "EX", 600);

    res
      .status(200)
      .json({ message: "Product fetched successfully ", products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // check for cached product if exist then send as response
    const cachedProduct = await client.get(`product:${id}`);

    if (cachedProduct) {
      return res.status(200).json(JSON.parse(cachedProduct));
    }

    // product is not cached then fetch from db
    const product = await Product.findOne({ _id: id })
      .populate({
        path: "rating.postedBy",
        select: "name , email",
      })
      .exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // set product in redis as its fetched cached
    await client.set(`product:${id}`, JSON.stringify(product), "EX", 3600);

    res.status(200).json({ message: "Product fetched successfully ", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deletProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete from redis
    await client.del(`product:${id}`);

    res.status(200).json({ message: "Product deleted successfully ", product });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOneAndUpdate(id, data, { new: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // delete from redis
    await client.del(`product:${id}`);

    res.status(200).json({ message: "Product Updated Successfully " });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const addReviewToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { star, content } = req.body;

    // Finding product and user
    const product = await Product.findById(id).exec();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findOne({ email: req.user.email }).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find if user has already rated the product
    const existingRatingIndex = product.rating.findIndex(
      (ele) => ele.postedBy.toString() == user._id.toString()
    );

    if (existingRatingIndex === -1) {
      // Add new rating
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          $push: {
            rating: { star, content, postedBy: user._id },
          },
        },
        { new: true }
      ).exec();

      return res
        .status(201)
        .json({
          message: "Rating added successfully",
          product: updatedProduct,
        });
    } else {
      // Update existing rating
      product.rating[existingRatingIndex].star = star;
      product.rating[existingRatingIndex].content = content;

      await product.save();

      return res
        .status(200)
        .json({ message: "Rating updated successfully", product });
    }

    await client.del(`product:${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  deletProduct,
  addReviewToProduct,
};
