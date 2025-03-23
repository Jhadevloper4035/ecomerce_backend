const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      index: true,
    },
    hsn: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    new: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String,
      },
    ],
    colour: {
      type: String,
      required: true,
    },
    category: [
      {
        type: String,
      },
    ],
    tag: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    sizes: [
      {
        type: String, // Example: "S", "M", "L", "XL", "XXL"
        enum: ["S", "M", "L", "XL", "XXL"],
      },
    ],
    materials: [
      {
        type: String,
      },
    ],
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
    },
    addInfo: [
      {
        type: String,
      },
    ],
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },
    saleCount: {
      type: Number,
      default: 0,
    },
    rating: [
      {
        star: Number, 
        content: String, 
        postedBy: { type: mongoose.Schema.Types.ObjectId,  ref: "User", }
      },
    ],

  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
