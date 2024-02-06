import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Types.ObjectId,
      quantity: Number,
      ref: "products",
    },
  ],
  address: String,
  totalAmount: {
    type: Number,
    required: true,
  },
});

const OrderModel = mongoose.model("Orders", OrderSchema);

export default OrderModel;
