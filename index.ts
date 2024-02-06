import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/auth.route";
import { errorHandler, tokenExtractor } from "./utils/middleware";
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
import UserModel from "./models/user.model";
import OtpModel from "./models/otp.model";
import productRouter from "./routes/product.route";
import cartRouter from "./routes/cart.route";
import orderRouter from "./routes/order.route";
import morgan from "morgan";
import cors from "cors";
import ProductModel from "./models/product.model";

app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
// mongoDb configuration
if (!MONGODB_URI) {
  console.log("MONGODB_URI not found");
} else {
  mongoose
    .connect(MONGODB_URI)
    .then((r) => {
      console.log("Db connected successfully");
    })
    .catch((err) => {
      console.log("Failed to connect DB: " + err.message);
      //   console.log(err);
    });
}

app.get("/ping", (req: Request, res: Response) => {
  return res.status(200).send("Pong");
});

app.use("/auth", authRouter);
app.use("/product", productRouter);
// user action
app.use("/cart", tokenExtractor, cartRouter);
app.use("/order", tokenExtractor, orderRouter);

// temporary route to clear the database
app.get("/clear-db", async (req: Request, res: Response) => {
  console.log("Clearing the DataBase");
  try {
    await UserModel.deleteMany({});
    await OtpModel.deleteMany({});
    await ProductModel.deleteMany({});
    console.log("Successfully Deleted the Database");
    return res.sendStatus(200);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log(err);
    }
    return res.sendStatus(500);
  }
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).send({
    valid: false,
    message: "Invalid Route",
  });
});

app.use(errorHandler);
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
