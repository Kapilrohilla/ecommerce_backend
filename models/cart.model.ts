import mongoose from "mongoose";

const model = new mongoose.Schema({
  userId: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  products: [
    {
      count: Number,
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const CartModel = mongoose.model("Cart", model);

export default CartModel;
