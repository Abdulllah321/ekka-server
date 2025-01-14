import express from "express";
import {
  createStore,
  getAllStores,
  getStoreById,
  getStoresByUser,
  updateStore,
  deleteStore,
  getStoreProducts,
  getStoreOrders,
} from "../controllers/storeController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticated);
// Routes for Store
router.post("/", createStore); // Create a new store
router.get("/", getAllStores); // Get all stores
router.get("/user", getStoresByUser); // Get all stores for the logged-in user
router.get("/:id", getStoreById); // Get a store by ID
router.put("/:id", updateStore); // Update a store by ID
router.delete("/:id", deleteStore); // Delete a store by ID

// Additional routes for Store
router.get("/:id/products", getStoreProducts); // Get all products for a store
router.get("/:id/orders", getStoreOrders); // Get all orders for a store

export default router;
