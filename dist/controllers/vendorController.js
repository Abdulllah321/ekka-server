"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.sendOtp = exports.verifyPassword = exports.otpLimiter = void 0;
const genrateOtp_1 = __importDefault(require("../services/genrateOtp"));
const emailTransporter_1 = require("../services/emailTransporter");
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const winston_1 = __importDefault(require("winston"));
const app_1 = require("../app");
const vendorVerificationEmailTemplate_1 = require("../services/vendorVerificationEmailTemplate");
const server_1 = require("../server");
// Logger setup
const logger = winston_1.default.createLogger({
    level: "info",
    transports: [
        new winston_1.default.transports.Console({ format: winston_1.default.format.simple() }),
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
    ],
});
// Rate limiter for OTP requests (limit to 5 requests per 15 minutes)
exports.otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 5 requests per windowMs
    message: "Too many OTP requests from this IP, please try again later.",
});
const verifyPassword = async (req, res) => {
    const { id } = req.user;
    const { password } = req.body;
    try {
        const userWithEmail = await app_1.prisma.user.findUnique({
            where: { id },
            select: { email: true, password: true },
        });
        if (!userWithEmail) {
            server_1.io.emit("statusUpdate", "User not found");
            res.status(404).json({ message: "User not found" });
            return;
        }
        const email = userWithEmail.email;
        const isPasswordValid = await bcrypt_1.default.compare(password, userWithEmail.password);
        if (!isPasswordValid) {
            server_1.io.emit("statusUpdate", `Invalid password for user: ${email}`);
            res.status(400).json({ message: "Invalid password" });
            return;
        }
        server_1.io.emit("statusUpdate", `Password verified for user: ${email}`);
        const newReq = { ...req, body: { email } };
        await (0, exports.sendOtp)(newReq, res); // Assuming sendOtp sends an OTP to the user
    }
    catch (error) {
        server_1.io.emit("statusUpdate", `Error verifying password: ${error.message}`);
        res.status(500).json({ message: "Error verifying password" });
    }
};
exports.verifyPassword = verifyPassword;
const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await app_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            logger.error(`User not found: ${email}`);
            res.status(404).json({ message: "User not found" });
            return;
        }
        const otpCode = (0, genrateOtp_1.default)();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes
        // Hash OTP before storing
        const hashedOtp = await bcrypt_1.default.hash(otpCode, 10);
        await app_1.prisma.user.update({
            where: { email },
            data: { otpCode: hashedOtp, otpExpiry },
        });
        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Vendor Verification OTP",
            html: (0, vendorVerificationEmailTemplate_1.verifyOtpTemplate)(otpCode),
        };
        await emailTransporter_1.transporter.sendMail(mailOptions);
        logger.info(`OTP sent to: ${email}`);
        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        logger.error(`Error sending OTP: ${error?.message}`);
        res.status(500).json({ message: "Error sending OTP" });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    const { email, otpCode } = req.body;
    try {
        const user = await app_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            logger.error(`User not found for OTP verification: ${email}`);
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Compare the provided OTP with the hashed OTP in the database
        const isOtpValid = await bcrypt_1.default.compare(otpCode, user.otpCode || "");
        if (!isOtpValid) {
            logger.warn(`Invalid OTP attempt for user: ${email}`);
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }
        if (new Date() > user.otpExpiry) {
            logger.warn(`Expired OTP for user: ${email}`);
            res.status(400).json({ message: "OTP expired" });
            return;
        }
        // Update verification status
        await app_1.prisma.user.update({
            where: { email },
            data: {
                verificationStatus: "verified",
                otpCode: null,
                otpExpiry: null,
                role: "vendor",
            },
        });
        logger.info(`Vendor verified successfully: ${email}`);
        res.status(200).json({ message: "Vendor verified successfully" });
    }
    catch (error) {
        logger.error(`Error verifying OTP: ${error.message}`);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};
exports.verifyOtp = verifyOtp;
