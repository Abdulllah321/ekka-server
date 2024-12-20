import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
  updateCartItemQuantity,
} from "../controllers/cartController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticated);

router.post("/", addToCart);

router.delete("/", removeFromCart);
router.put("/quantity", updateCartItemQuantity);

router.get("/", getCart);

router.delete("/clear", clearCart);

export default router;
