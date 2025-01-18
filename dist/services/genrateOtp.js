"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.default = generateOtp;
