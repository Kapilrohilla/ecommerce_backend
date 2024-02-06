import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    password: String,
    email: {
      type: String,
      unique: true,
    },
    dateOfBirth: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    favourite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Products",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
