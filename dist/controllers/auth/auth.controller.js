"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.verifyOtp = exports.checkUser = exports.logoutUser = exports.resetPasswordWithOtp = exports.requestPasswordReset = exports.loginUser = exports.registerUser = exports.sendEmail = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_1 = require("../../app");
const client_1 = require("@prisma/client");
// Utility function to send email
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", // Change to your email provider
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password or app password
        },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};
exports.sendEmail = sendEmail;
// Register new user
const registerUser = async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber, profileImage } = req.body;
    // Check if user already exists
    const existingUser = await app_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    // Create user
    const user = await app_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            profileImage,
            role: client_1.UserRole.customer, // Default to customer role
        },
    });
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" } // Token expiration (1 hour in this case)
    );
    // Set the token in the cookie
    res.cookie("accessToken", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
    res.status(201).json({ message: "User registered successfully", user });
};
exports.registerUser = registerUser;
// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // Find the user by email
    const user = await app_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    // Compare the password with the hashed password in the database
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }
    // Create JWT token with 30 days expiration
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" } // Token expiration set to 30 days
    );
    // Set the token in the cookie
    res.cookie("accessToken", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
    res.status(200).json({ message: "Login successful" });
};
exports.loginUser = loginUser;
// Request password reset via OTP
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    // Find the user by email
    const user = await app_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes
    // Save OTP and expiry to the user's record
    await app_1.prisma.user.update({
        where: { email },
        data: { otpCode, otpExpiry },
    });
    // Send OTP via email
    await (0, exports.sendEmail)(email, "OTP for Password Reset", `Your OTP code is: ${otpCode}`);
    res.status(200).json({ message: "OTP sent to your email" });
};
exports.requestPasswordReset = requestPasswordReset;
// Reset password using OTP
const resetPasswordWithOtp = async (req, res) => {
    const { email, newPassword } = req.body;
    // Find the user by email
    const user = await app_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    // Hash the new password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Update the user's password
    await app_1.prisma.user.update({
        where: { email },
        data: { password: hashedPassword, otpCode: null, otpExpiry: null },
    });
    res.status(200).json({ message: "Password reset successful" });
};
exports.resetPasswordWithOtp = resetPasswordWithOtp;
const logoutUser = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logout successful" });
};
exports.logoutUser = logoutUser;
const checkUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        // Fetch the user from the database
        const user = await app_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                role: true,
                id: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Return the user data
        res.status(200).json({
            id: user.id,
            role: user.role,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};
exports.checkUser = checkUser;
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await app_1.prisma.user.findUnique({
            where: { email },
            select: { otpCode: true, otpExpiry: true },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (new Date() > user.otpExpiry) {
            res.status(400).json({ message: "OTP expired" });
            return;
        }
        console.log("Otp code" + user.otpCode);
        console.log("Otp " + otp);
        if (user.otpCode !== otp) {
            res.status(400).json({ message: "Invalid OTP." });
            return;
        }
        // Reset the OTP and otpExpiry fields
        await app_1.prisma.user.update({
            where: { email },
            data: { otpCode: null, otpExpiry: null },
        });
        res.status(200).json({ message: "OTP verified successfully." });
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "An error occurred while verifying OTP." });
    }
};
exports.verifyOtp = verifyOtp;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;
    try {
        const user = await app_1.prisma.user.findUnique({
            where: { id },
            select: { password: true },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Current password is incorrect." });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await app_1.prisma.user.update({
            where: { id },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({ message: "Password changed successfully." });
    }
    catch (error) {
        console.error("Error changing password:", error);
        res
            .status(500)
            .json({ message: "An error occurred while changing password." });
    }
};
exports.changePassword = changePassword;
