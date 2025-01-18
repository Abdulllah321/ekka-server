"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticated);
// Routes
router.post("/", orderController_1.createOrder); // Create an order
router.get("/user", orderController_1.fetchOrderByUser); // Fetch orders by the authenticated user
router.get("/:id", orderController_1.getOrderById); // Get a specific order by ID
router.get("/", orderController_1.getAllOrders); // Fetch all orders
router.patch("/:id", orderController_1.updateOrderStatus); // Update an order's status
router.delete("/:id", orderController_1.deleteOrder); // Delete an order by ID
exports.default = router;
