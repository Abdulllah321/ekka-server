import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
} from "../controllers/productController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

// CREATE product
router.post("/products",  createProduct);

// READ all products
router.get("/products", getAllProducts);

// READ product by ID
router.get("/products/:slug", getProductBySlug);

// UPDATE product by ID
router.put("/products/:id", authenticated, updateProduct);

// DELETE product by ID
router.delete("/products/:id", authenticated, deleteProduct);

export default router;
