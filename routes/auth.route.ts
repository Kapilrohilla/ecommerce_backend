import { Router } from "express";
import {
  LoginController,
  SignUpController,
  sendOtp,
  verifyOtp,
} from "../controller/auth.controller";
import { tokenExtractor } from "../utils/middleware";
const router = Router();

router.post("/login", LoginController);
router.post("/signup", SignUpController);
router.post("/send-otp", tokenExtractor, sendOtp);
router.post("/verify-otp", verifyOtp);
export default router;
