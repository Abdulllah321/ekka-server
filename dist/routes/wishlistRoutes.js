"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const wishlistController_1 = require("../controllers/wishlistController");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticated);
// Route to add a product to the cart
router.post("/", wishlistController_1.createWishlist);
// Route to remove a product from the cart
router.delete("/", wishlistController_1.removeItemFromWishlist);
// Route to get all items in the cart
router.get("/", wishlistController_1.getWishlists);
exports.default = router;
