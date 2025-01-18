"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// CREATE product
router.post("/products", authMiddleware_1.authenticated, productController_1.createProduct);
// READ all products
router.get("/products", productController_1.getAllProducts);
// READ product by ID
router.get("/products/:slug", productController_1.getProductBySlug);
// UPDATE product by ID
router.put("/products/:id", authMiddleware_1.authenticated, productController_1.updateProduct);
// DELETE product by ID
router.delete("/products/:id", authMiddleware_1.authenticated, productController_1.deleteProduct);
exports.default = router;
