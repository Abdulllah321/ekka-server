"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const adminController_1 = require("../controllers/auth/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Admin Login Route
router.post("/admin/login", adminController_1.adminLogin);
// Check if Admin Exists Route
router.get("/admin/check", adminController_1.checkAdmin);
router.post("/register", auth_controller_1.registerUser); // Register user and send token in cookies
router.post("/login", auth_controller_1.loginUser); // Login user and send token in cookies
router.post("/request-password-reset", auth_controller_1.requestPasswordReset); // Password reset via OTP
router.post("/reset-password", auth_controller_1.resetPasswordWithOtp);
router.post("/logout", auth_controller_1.logoutUser);
router.post("/verify-otp", auth_controller_1.verifyOtp);
router.get("/check-user", authMiddleware_1.authenticated, auth_controller_1.checkUser);
router.post("/change-password", authMiddleware_1.authenticated, auth_controller_1.changePassword);
exports.default = router;
