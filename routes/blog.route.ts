import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  getSpecificBlog,
} from "../controller/blog.controller";
import { upload } from "../utils/multerconfig";

const blogRouter = Router();

blogRouter.get("/", getBlogs);
blogRouter.get("/:id", getSpecificBlog);
blogRouter.post("/", upload.single("image"), createBlog);
blogRouter.delete("/:id", deleteBlog);

export default blogRouter;
