"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticated);
router.post("/", reviewController_1.createReview);
router.get("/", reviewController_1.getAllReviews);
router.get("/id/:id", reviewController_1.fetchReviewById);
router.get("/:productId", reviewController_1.getReviewsByProduct);
router.delete("/:id", reviewController_1.deleteReview);
exports.default = router;
