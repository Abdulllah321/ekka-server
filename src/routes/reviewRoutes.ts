import express from "express";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getAllReviews,
  fetchReviewById,
} from "../controllers/reviewController";
import { authenticated } from "../middlewares/authMiddleware";

const router = express.Router();
router.use(authenticated);
router.post("/", createReview);

router.get("/", getAllReviews);

router.get("/id/:id", fetchReviewById);

router.get("/:productId", getReviewsByProduct);

router.delete("/:id", deleteReview);

export default router;
