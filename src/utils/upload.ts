import multer from "multer";
import path from "path";
import { Request, Response } from "express";
import fs from "fs";

// Define the storage configuration with proper TypeScript types
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = "src/uploads/";

    // Check if the 'uploads' folder exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the folder if it doesn't exist
    }

    cb(null, uploadDir); // The folder where images will be saved
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname); // Get file extension
    cb(null, `${Date.now()}${ext}`); // Create a unique file name
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

export default upload;
