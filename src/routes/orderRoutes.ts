import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  fetchOrderByUser,
} from "../controllers/orderController";
import { authenticated } from "../middlewares/authMiddleware";

const router = Router();
router.use(authenticated);

// Routes
router.post("/", createOrder); // Create an order
router.get("/user", fetchOrderByUser); // Fetch orders by the authenticated user
router.get("/:id", getOrderById); // Get a specific order by ID
router.get("/", getAllOrders); // Fetch all orders
router.patch("/:id", updateOrderStatus); // Update an order's status
router.delete("/:id", deleteOrder); // Delete an order by ID

export default router;
