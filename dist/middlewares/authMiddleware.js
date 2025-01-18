"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to verify if the user is authenticated
const authenticated = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }
    try {
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.id) {
            req.user = { id: decoded.id, role: decoded.role };
        }
        else if (decoded.userId) {
            req.user = { id: decoded.userId, role: decoded.role };
        }
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.authenticated = authenticated;
