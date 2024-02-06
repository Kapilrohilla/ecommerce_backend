import { Router } from "express";
import {
  add2cart,
  clearCart,
  getCart,
  removefromCart,
  updatedAddress,
} from "../controller/cart.controller";

const router = Router();

//@ts-ignore
router.post("/add", add2cart);
//@ts-ignore
router.delete("/clear", clearCart);
router.post("/remove", removefromCart);
router.get("/", getCart);
router.post("/address", updatedAddress);

export default router;
