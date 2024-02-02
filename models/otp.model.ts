import mongoose from "mongoose";
import type { Date, ObjectId } from "mongoose";
const OtpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    otp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OtpModel = mongoose.model("Otp", OtpSchema);
export default OtpModel;

export type OtpModelType = {
  user: ObjectId;
  _id: ObjectId;
  otp: number;
  createdAt: Date;
  updatedAt: Date;
};
