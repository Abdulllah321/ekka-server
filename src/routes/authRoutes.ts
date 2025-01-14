import { Router } from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPasswordWithOtp,
  logoutUser,
  checkUser,
  changePassword,
  verifyOtp,
} from "../controllers/auth/auth.controller";
import { adminLogin, checkAdmin } from "../controllers/auth/adminController";
import { authenticated } from "../middlewares/authMiddleware";

const router = Router();

// Admin Login Route
router.post("/admin/login", adminLogin);

// Check if Admin Exists Route
router.get("/admin/check", checkAdmin);

router.post("/register", registerUser); // Register user and send token in cookies
router.post("/login", loginUser); // Login user and send token in cookies
router.post("/request-password-reset", requestPasswordReset); // Password reset via OTP
router.post("/reset-password", resetPasswordWithOtp);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);
router.get("/check-user", authenticated, checkUser);
router.post("/change-password", authenticated, changePassword);

export default router;
