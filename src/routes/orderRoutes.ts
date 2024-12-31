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
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.get("/", getAllOrders);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);
router.get("/user", fetchOrderByUser);

export default router;