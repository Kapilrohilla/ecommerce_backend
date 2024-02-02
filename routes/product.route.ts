import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  getSpecificProduct,
} from "../controller/product.controller";
import { upload } from "../utils/multerconfig";

const productRouter = Router();

productRouter.post("/", upload.single("image"), createProduct);
productRouter.get("/category", getCategories);
productRouter.get("/", getProducts);
productRouter.get("/:id", getSpecificProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
