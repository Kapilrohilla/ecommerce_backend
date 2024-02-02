import type { NextFunction, Request, Response } from "express";
import BlogModel from "../models/blog.model";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import MiniBlogModel from "../models/blog.model";

type queryList = {
  skip?: string;
  limit?: string;
};

const storage = getStorage();

export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { skip = "0", limit = "20" }: queryList = req.query;

  try {
    const blogs = await BlogModel.find({})
      .skip(Number(skip))
      .limit(Number(limit));

    return res.json({ valid: true, blogs });
  } catch (err: unknown) {
    next(err);
  }
  return res.sendStatus(500);
};

export const getSpecificBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id }: { id?: String } = req.params;
  if (!id) {
    return res.send(200).json({
      valid: false,
      message: "Blogid is required",
    });
  } else {
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.send({
        valid: true,
        message: "Blog not found",
      });
    } else {
      return res.send({ valid: true, blog });
    }
  }
};

type createBlogBody = {
  title: String;
  description: String;
};
export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: createBlogBody = req.body;

  if (!(body.title && body.description)) {
    return res.json({
      vaild: false,
      message: "Title and Description are required",
    });
  }

  const image = req.file;
  let downloadUrl: string | null = null;
  if (image) {
    const currentTime = new Date();
    const imageRef = ref(
      storage,
      `Images/blog/${image?.originalname}--&&--time${currentTime}`
    );

    const metaData = { contentType: image.mimetype };
    try {
      const uploadImage = await uploadBytesResumable(
        imageRef,
        image.buffer,
        metaData
      );

      downloadUrl = await getDownloadURL(imageRef);
    } catch (err: unknown) {
      next(err);
    }
  }
  const blog = new BlogModel({
    title: body.title,
    description: body.description,
    image: downloadUrl,
  });

  try {
    const savedBlog = await blog.save();
    return res.json({
      valid: true,
      blog: savedBlog,
    });
  } catch (err) {
    next(err);
  }
  return;
};
export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id }: { id?: string } = req.params;
  if (!id) {
    return res.status(200).send({
      valid: false,
      message: "Blog id is required in params",
    });
  }
  try {
    const deletedBlog: any = await MiniBlogModel.findByIdAndDelete(id);
    console.log(deletedBlog);

    if (deletedBlog?.image) {
      const image = deletedBlog["image"];
      const imageRef = ref(storage, image);
      try {
        const deleteImageResponse = await deleteObject(imageRef);
        console.log(deleteImageResponse, 0);
      } catch (err) {
        console.log(err);
      }
    }
    if (!deletedBlog) {
      return res.status(200).send({
        valid: false,
        message: "Blog not found",
      });
    } else {
      return res.status(200).send({
        valid: true,
        products: deletedBlog,
      });
    }
  } catch (err) {
    next(err);
  }
  return;
};
