import express from "express";
import { authenticated } from "../middlewares/authMiddleware";
import { addItemsToWishlist, createWishlist, getWishlists, removeItemFromWishlist } from "../controllers/wishlistController";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticated);
// Route to add a product to the cart
router.post("/", createWishlist);
// Route to remove a product from the cart
router.delete("/", removeItemFromWishlist);
// Route to get all items in the cart
router.get("/", getWishlists);


export default router;
