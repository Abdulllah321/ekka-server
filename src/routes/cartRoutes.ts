import express from "express";
import {
  addToCart,
  removeFromCart,
  getCartItems,
  clearCart,
  updateCartItemQuantity,
  getCartCount,
  getCart,
} from "../controllers/cartController";
import { authenticated } from "../middlewares/authMiddleware";
import { calculateCartTotals } from "../middlewares";

const router = express.Router();

router.use(authenticated, calculateCartTotals);

router.post("/", addToCart);

router.delete("/", removeFromCart);
router.put("/quantity", updateCartItemQuantity);

router.get("/item", getCartItems);
router.get("/", getCart);

router.get("/count", getCartCount);

router.delete("/clear", clearCart);

export default router;
