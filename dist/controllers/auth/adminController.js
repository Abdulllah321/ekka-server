"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_1 = require("../../app");
// Admin Login Logic
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await app_1.prisma.admin.findUnique({
            where: { username },
        });
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: "ADMIN" }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });
        res.json({ message: "Login successful" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.adminLogin = adminLogin;
const checkAdmin = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if the role is ADMIN
        if (decoded.role !== "ADMIN") {
            res
                .status(403)
                .json({ error: "Forbidden: You do not have admin privileges" });
            return;
        }
        res
            .status(200)
            .json({ message: "Admin verified successfully", adminId: decoded.id });
    }
    catch (error) {
        console.error("Token verification failed:", error);
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.checkAdmin = checkAdmin;
