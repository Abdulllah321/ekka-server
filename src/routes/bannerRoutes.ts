import express from "express";
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController";

const router = express.Router();

// Create a new banner
router.post("/", createBanner);

// Get all banners
router.get("/", getAllBanners);

// Get a single banner by ID
router.get("/:id", getBannerById);

// Update a banner by ID
router.put("/:id", updateBanner);

// Delete a banner by ID
router.delete("/:id", deleteBanner);

export default router;
