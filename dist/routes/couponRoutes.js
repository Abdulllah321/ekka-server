"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../controllers/couponController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticated, middlewares_1.expireCouponsMiddleware);
// Get all coupons
router.get("/", couponController_1.getAllCoupons);
// Get a single coupon by ID
router.get("/:id", couponController_1.getCouponById);
// Get a single coupon by Code
router.get("/code/:code", couponController_1.getCouponByCode);
// Create a new coupon
router.post("/", couponController_1.createCoupon);
// Get coupons by store ID
router.get("/store/:storeId", couponController_1.getCouponsByStore);
// Update an existing coupon
router.put("/:id", couponController_1.updateCoupon);
// Delete a coupon
router.delete("/:id", couponController_1.deleteCoupon);
exports.default = router;
