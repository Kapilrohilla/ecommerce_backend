import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    products: [
      {
        productid: {
          type: mongoose.Types.ObjectId,
          ref: "Products",
        },
        quantity: Number,
        _id: false,
      },
    ],
    address: String,
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("Orders", OrderSchema);

export default OrderModel;
