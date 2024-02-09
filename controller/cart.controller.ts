import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";
import ProductModel from "../models/product.model";

export interface ExtendedRequest extends Request {
  token?: string;
}
export const getCart = async (
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

  const user = await UserModel.findOne({ email: email }).populate(
    "cart.product"
  );

  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "user don't exists, provide correct token",
    });
  }

  return res.status(200).send({
    valid: true,
    cartData: user.cart,
  });
};

export const add2cart = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const body: any = req.body;
  const userToken = req.token;
  // console.log(body);
  if (!body.productId) {
    return res.status(200).send({
      valid: false,
      message: "productId is required",
    });
  }

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

  const user = await UserModel.findOne({ email: email });
  let product = null;
  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "user don't exists, provide correct token",
    });
  }
  try {
    product = await ProductModel.findById(body?.productId);

    if (product?.stock && product?.stock > 0) {
      // checking if the prodcut is available in cart or not
      let updated;
      user.cart.forEach((productObj) => {
        if (productObj.product?.toString() === body?.productId) {
          productObj.quantity = productObj.quantity + 1;
          updated = true;
        }
      });
      if (!updated) {
        user.cart.push({ product: body.productId, quantity: 1 });
      }
      console.log(user.cart, "< - cart");
      const updatedUser = await user.save();

      return res.status(201).send({
        valid: true,
        message: "added to cart",
        user: updatedUser,
      });
    } else {
      return res.status(200).send({
        valid: false,
        message: "out of stock",
      });
    }
  } catch (err: unknown) {
    next(err);
  }
};

export const removefromCart = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const userToken = req.token;
  const body: any = req.body;

  if (!body.productId) {
    return res.status(200).send({
      valid: false,
      message: "productId is required",
    });
  }

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

  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "user don't exists, provide correct token",
    });
  }
  try {
    let isUpdated = false;
    let isLast = false;
    user.cart.forEach((productObj) => {
      if (productObj.product?.toString() === body.productId) {
        if (productObj.quantity <= 1) {
          isLast = true;
          return;
        }
        productObj.quantity = productObj.quantity - 1;
        isUpdated = true;
      }
    });
    // remove  the product from cart
    if (isLast) {
      isUpdated = true;
      const updatedCart = user.cart.filter((productObj) => {
        return productObj.product.toString() !== body.productId;
      });
      //@ts-ignore
      user.cart = updatedCart;
    }

    if (!isUpdated) {
      return res.status(200).send({
        valid: false,
        message: "product id not found in cart",
        user: user,
      });
    }

    const updatedUser = await user.save();

    return res.status(200).send({
      valid: true,
      message: "product removed from cart",
      user: updatedUser,
    });
  } catch (err) {
    return next(err);
  }
};

export const clearCart = async (
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

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "user dont exists, provide correct token",
    });
  }
  try {
    //@ts-ignore
    user.cart = [];
    const updatedUser = await user.save();
    return res.status(200).send({
      valid: true,
      message: "cart clear success",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

export const updatedAddress = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const userToken = req.token;
  const body: any = req.body;
  const address: string = req.body.address;

  if (typeof address !== "string") {
    return res.status(200).send({
      valid: false,
      message: "address must be a string",
    });
  }

  if (!userToken) {
    return res.status(200).send({
      valid: false,
      message: "Token is required",
    });
  }

  if (!address) {
    return res.status(200).send({
      valid: false,
      message: "address is required",
    });
  }

  let email;
  try {
    email = jwt.verify(userToken, process.env.SECRET!);
  } catch (err) {
    return next(err);
  }

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return res.status(200).send({
      valid: false,
      message: "failed to find user",
    });
  }
  user.address = address;

  const updatedUser = await user.save();

  return res.status(200).send({
    valid: true,
    user: updatedUser,
  });
};
