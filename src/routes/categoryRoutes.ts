import { Router } from "express";
import {
  createMainCategory,
  getAllMainCategories,
  updateMainCategory,
  deleteMainCategory,
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getMainCategoryById,
  createManyMainCategories,
  createManySubCategories,
} from "../controllers/categoryController";
import { authenticated } from "../middlewares/authMiddleware";

const router = Router();

/**
 * MainCategory Routes
 */
router.get("/categories", getAllMainCategories);
router.post("/categories/many", createManyMainCategories);
router.post("/categories", authenticated, createMainCategory);
router.get("/categories/:id", getMainCategoryById);
router.put("/categories/:id", authenticated, updateMainCategory);
router.delete("/categories/:id", authenticated, deleteMainCategory);

router.post("/subcategories/many", createManySubCategories);
router.get("/subcategories", getAllSubCategories);
router.post("/subcategories", authenticated, createSubCategory);
router.get("/subcategories/:id", getSubCategoryById);
router.put("/subcategories/:id", authenticated, updateSubCategory);
router.delete("/subcategories/:id", authenticated, deleteSubCategory);

export default router;
