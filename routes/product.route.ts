import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getBrand,
  getCategories,
  getProducts,
  getSpecificProduct,
} from "../controller/product.controller";
import { upload } from "../utils/multerconfig";

const productRouter = Router();

productRouter.post("/", upload.single("image"), createProduct);
productRouter.get("/category", getCategories);
productRouter.get("/brand", getBrand);
productRouter.get("/", getProducts);
productRouter.get("/:id", getSpecificProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
