import express from "express";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
} from "../controllers/reviewController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();
router.use(authenticated);
// Create a new review
router.post("/", createReview);

// Get all reviews for a product
router.get("/:productId", getReviewsByProduct);

// Delete a review
router.delete("/:id", deleteReview);

export default router;
