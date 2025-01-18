"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticated, middlewares_1.calculateCartTotals);
router.post("/", cartController_1.addToCart);
router.delete("/", cartController_1.removeFromCart);
router.put("/quantity", cartController_1.updateCartItemQuantity);
router.get("/item", cartController_1.getCartItems);
router.get("/", cartController_1.getCart);
router.get("/count", cartController_1.getCartCount);
router.delete("/clear", cartController_1.clearCart);
exports.default = router;
