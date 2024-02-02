import type { NextFunction, Request, Response } from "express";
import ProductModel from "../models/product.model";
import {
  getDownloadURL,
  getStorage,
  ref,
  deleteObject,
  uploadBytesResumable,
} from "firebase/storage";

import { initializeApp } from "firebase/app";

type CreateProductPayload = {
  name: String;
  description: String;
  numberOfColors?: String;
  price: String;
  category: String;
};
// firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
// Initialize Firebase
initializeApp(firebaseConfig);

const storage = getStorage();

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: CreateProductPayload = req.body;
  const image = req.file;

  if (!(body.name && body.price && body.description && body.category)) {
    return res.status(200).send({
      valid: false,
      message: "product's name, category, description, price are required",
    });
  }

  const currentTime = new Date();

  let uploadedImageUrl = null;
  if (image) {
    const imageRef = ref(
      storage,
      `Images/product/${image.originalname}--&&--time=${currentTime}`
    );
    const metadata = {
      contentType: image.mimetype,
    };

    try {
      const uploadImage = await uploadBytesResumable(
        imageRef,
        image.buffer,
        metadata
      );
      uploadedImageUrl = await getDownloadURL(imageRef);
    } catch (err) {
      next(err);
    }
  }

  const product = new ProductModel({
    ...body,
    image: uploadedImageUrl,
  });

  try {
    const savedProduct = await product.save();
    return res.status(200).send({
      valid: true,
      product: savedProduct,
    });
  } catch (err: unknown) {
    next(err);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { skip = 0, limit = 20, category } = req.query;
  try {
    let products;
    if (category) {
      products = await ProductModel.find({ category })
        .sort({ _id: -1 })
        .skip(Number(skip))
        .limit(Number(limit));
    } else {
      products = await ProductModel.find({})
        .sort({ _id: -1 })
        .skip(Number(skip))
        .limit(Number(limit));
    }

    return res.status(200).send({
      valid: true,
      products,
    });
  } catch (err) {
    next(err);
  }
  return res.sendStatus(500);
};

export const getSpecificProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId: string = req.params?.id;

  if (!productId) {
    return res.status(200).send({
      valid: false,
      message: "ProductId is requried",
    });
  } else {
    try {
      const product = await ProductModel.findById(productId);

      if (!product) {
        return res.status(200).send({
          valid: false,
          message: "Product not found",
        });
      } else {
        return res.status(200).send({ valid: true, product });
      }
    } catch (err: unknown) {
      next(err);
    }
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await ProductModel.find({})
      .sort("-1")
      .distinct("category");

    return res.status(200).send({
      valid: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id }: { id?: string } = req.params;
  if (!id) {
    return res.status(200).send({
      valid: false,
      message: "Product id is required in params",
    });
  }
  try {
    const deletedProduct: any = await ProductModel.findByIdAndDelete(id);

    if (deletedProduct?.image) {
      const image = deletedProduct["image"];
      const imageRef = ref(storage, image);
      try {
        const deleteImageResponse = await deleteObject(imageRef);
      } catch (err) {
        console.log(err);
      }
    }
    if (!deletedProduct) {
      return res.status(200).send({
        valid: false,
        message: "Product not found",
      });
    } else {
      return res.status(200).send({
        valid: true,
        products: deletedProduct,
      });
    }
  } catch (err) {
    next(err);
  }
};
