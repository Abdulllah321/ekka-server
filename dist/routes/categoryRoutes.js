"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * MainCategory Routes
 */
router.get("/categories", categoryController_1.getAllMainCategories);
router.post("/categories/many", categoryController_1.createManyMainCategories);
router.post("/categories", authMiddleware_1.authenticated, categoryController_1.createMainCategory);
router.get("/categories/:id", categoryController_1.getMainCategoryById);
router.put("/categories/:id", authMiddleware_1.authenticated, categoryController_1.updateMainCategory);
router.delete("/categories/:id", authMiddleware_1.authenticated, categoryController_1.deleteMainCategory);
router.post("/subcategories/many", categoryController_1.createManySubCategories);
router.get("/subcategories", categoryController_1.getAllSubCategories);
router.post("/subcategories", authMiddleware_1.authenticated, categoryController_1.createSubCategory);
router.get("/subcategories/:id", categoryController_1.getSubCategoryById);
router.put("/subcategories/:id", authMiddleware_1.authenticated, categoryController_1.updateSubCategory);
router.delete("/subcategories/:id", authMiddleware_1.authenticated, categoryController_1.deleteSubCategory);
exports.default = router;
