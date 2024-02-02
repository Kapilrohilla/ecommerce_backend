import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    numberOfColor: String,
    category: String,
    price: Number,
    image: String,
    stock: Number,
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Products", ProductSchema);

export default ProductModel;
