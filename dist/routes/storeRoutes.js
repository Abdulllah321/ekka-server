"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storeController_1 = require("../controllers/storeController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticated);
// Routes for Store
router.post("/", storeController_1.createStore); // Create a new store
router.get("/", storeController_1.getAllStores); // Get all stores
router.get("/user", storeController_1.getStoresByUser); // Get all stores for the logged-in user
router.get("/:id", storeController_1.getStoreById); // Get a store by ID
router.put("/:id", storeController_1.updateStore); // Update a store by ID
router.delete("/:id", storeController_1.deleteStore); // Delete a store by ID
// Additional routes for Store
router.get("/:id/products", storeController_1.getStoreProducts); // Get all products for a store
router.get("/:id/orders", storeController_1.getStoreOrders); // Get all orders for a store
exports.default = router;
