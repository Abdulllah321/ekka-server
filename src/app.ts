import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import upload from "./utils/upload";
import cron from "node-cron";

//routes import
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import bannerRoutes from "./routes/bannerRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import couponRoutes from "./routes/couponRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import reviewsRoutes from "./routes/reviewRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import storeRoutes from "./routes/storeRoutes";
import searchRoutes from "./routes/searchRoute";
import { PrismaClient } from "@prisma/client";

const app: Application = express();
const prisma = new PrismaClient();

// Get allowed origins from environment variables (you can list multiple URLs separated by commas)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

// Middleware
app.use(express.urlencoded({ limit: "10mb", extended: true })); // 10MB limit for URL-encoded bodies
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); // 10MB limit for JSON bodies

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/search", searchRoutes);

// Upload API
app.post(
  "/api/upload",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const filePath = path.join("uploads", req.file.filename);

      res.status(200).json({
        message: "File uploaded successfully",
        fileName: req.file.filename,
        filePath: filePath,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error });
    }
  }
);

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce Backend!");
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to update product `isNew` status...");
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await prisma.product.updateMany({
      where: {
        createdAt: { lte: twoDaysAgo },
        isNew: true,
      },
      data: {
        isNew: false,
      },
    });

    console.log(`Updated ${result.count} products to set isNew to false.`);
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});

export { app, prisma };
