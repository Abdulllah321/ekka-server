"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const upload_1 = __importDefault(require("./utils/upload"));
const node_cron_1 = __importDefault(require("node-cron"));
//routes import
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const bannerRoutes_1 = __importDefault(require("./routes/bannerRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
exports.app = app;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Get allowed origins from environment variables (you can list multiple URLs separated by commas)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};
// Middleware
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true })); // 10MB limit for URL-encoded bodies
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "10mb" })); // 10MB limit for JSON bodies
// Serve static files from the 'uploads' directory
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api", categoryRoutes_1.default);
app.use("/api", productRoutes_1.default);
app.use("/api/banners", bannerRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/wishlist", wishlistRoutes_1.default);
app.use("/api/coupons", couponRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/vendor", vendorRoutes_1.default);
app.use("/api/stores", storeRoutes_1.default);
// Upload API
app.post("/api/upload", upload_1.default.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const filePath = path_1.default.join("uploads", req.file.filename);
        res.status(200).json({
            message: "File uploaded successfully",
            fileName: req.file.filename,
            filePath: filePath,
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file", error });
    }
});
app.get("/", (req, res) => {
    res.send("Welcome to the E-commerce Backend!");
});
node_cron_1.default.schedule("0 0 * * *", async () => {
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
    }
    catch (error) {
        console.error("Error running cron job:", error);
    }
});
