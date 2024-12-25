import { Router } from "express";
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
} from "../controllers/couponController";
import { authenticated } from "../middlewares/authMiddleware";
import { expireCouponsMiddleware } from "../middlewares";

const router = Router();
router.use(authenticated, expireCouponsMiddleware);
// Get all coupons
router.get("/", getAllCoupons);

// Get a single coupon by ID
router.get("/:id", getCouponById);
// Get a single coupon by Code
router.get("/code/:code", getCouponByCode);

// Create a new coupon
router.post("/", createCoupon);

// Update an existing coupon
router.put("/:id", updateCoupon);

// Delete a coupon
router.delete("/:id", deleteCoupon);

export default router;
