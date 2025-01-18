"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the storage configuration with proper TypeScript types
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "src/uploads/";
        // Check if the 'uploads' folder exists, if not, create it
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true }); // Create the folder if it doesn't exist
        }
        cb(null, uploadDir); // The folder where images will be saved
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname); // Get file extension
        cb(null, `${Date.now()}${ext}`); // Create a unique file name
    },
});
// Initialize multer with the storage configuration
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
