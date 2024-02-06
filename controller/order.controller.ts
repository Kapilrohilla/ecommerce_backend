import { NextFunction, Response } from "express";
import { ExtendedRequest } from "./cart.controller";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";
import OrderModel from "../models/order.model";
import ProductModel from "../models/product.model";

export const createOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const userToken = req.token;

  if (!userToken) {
    return res.status(200).send({
      valid: false,
      message: "Token is required",
    });
  }
  let email;
  try {
    email = jwt.verify(userToken, process.env.SECRET!);
  } catch (err) {
    return next(err);
  }

  let user;
  try {
    user = await UserModel.findOne({ email: email });
  } catch (err) {
    return next(err);
  }
  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "user not found",
    });
  }
  const cart = user.cart;
  const userId = user._id;
  if (cart.length === 0) {
    return res.send({ valid: false, message: "cart is empty" });
  }
  // const totalAmount = cart.forEach(async (acc, product) => {
  //   // console.log(product, "< -product");
  //   const fetchedProduct = await ProductModel.findById(product.product)
  //   // @ts-ignore
  //   return acc + product.price;
  // }, 0);
  let totalAmount = 0;

  for (let i = 0; i < cart.length; i++) {
    const productId = cart[i].product;
    const fetchedProduct = await ProductModel.findById(productId);
    if (!fetchedProduct) {
      continue;
    }
    totalAmount += cart[i].quantity * fetchedProduct.price;
  }
  console.log(totalAmount);
  const address = user.address;

  const order = new OrderModel({
    userId,
    products: cart,
    address,
    totalAmount,
  });
  let orderCreatedSuccessfully = null;
  try {
    orderCreatedSuccessfully = await order.save();
    // @ts-ignore
    user.cart = [];
    user.orders.push(orderCreatedSuccessfully._id);
    const updatedUser = await user.save();

    console.log(updatedUser);
  } catch (err) {
    return next(err);
  }

  return res.status(200).send(orderCreatedSuccessfully);
};
