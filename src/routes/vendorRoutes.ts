import express from "express";
import {
  otpLimiter,
  sendOtp,
  verifyOtp,
  verifyPassword,
} from "../controllers/vendorController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticated);
// Send OTP for verification
router.post("/verify-password", otpLimiter, verifyPassword);
router.post("/send-otp", otpLimiter, sendOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
