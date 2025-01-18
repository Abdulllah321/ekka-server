"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bannerController_1 = require("../controllers/bannerController");
const router = express_1.default.Router();
// Create a new banner
router.post("/", bannerController_1.createBanner);
// Get all banners
router.get("/", bannerController_1.getAllBanners);
// Get a single banner by ID
router.get("/:id", bannerController_1.getBannerById);
// Update a banner by ID
router.put("/:id", bannerController_1.updateBanner);
// Delete a banner by ID
router.delete("/:id", bannerController_1.deleteBanner);
exports.default = router;
