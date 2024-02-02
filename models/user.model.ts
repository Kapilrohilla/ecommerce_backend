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
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
