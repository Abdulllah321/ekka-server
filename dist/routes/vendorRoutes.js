"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendorController_1 = require("../controllers/vendorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticated);
// Send OTP for verification
router.post("/verify-password", vendorController_1.otpLimiter, vendorController_1.verifyPassword);
router.post("/send-otp", vendorController_1.otpLimiter, vendorController_1.sendOtp);
// Verify OTP
router.post("/verify-otp", vendorController_1.verifyOtp);
exports.default = router;
