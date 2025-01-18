"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManySubCategories = exports.deleteSubCategory = exports.updateSubCategory = exports.getSubCategoryById = exports.getAllSubCategories = exports.createSubCategory = exports.createManyMainCategories = exports.deleteMainCategory = exports.updateMainCategory = exports.getMainCategoryById = exports.getAllMainCategories = exports.createMainCategory = void 0;
const app_1 = require("../app");
const slugify_1 = require("../utils/slugify");
const createMainCategory = async (req, res) => {
    const { name, slug, shortDesc, fullDesc, imageUrl } = req.body;
    const uniqueSlug = slug || await (0, slugify_1.generateUniqueSlug)(name, 'mainCategory');
    try {
        const mainCategory = await app_1.prisma.mainCategory.create({
            data: {
                name,
                slug: uniqueSlug,
                shortDesc,
                fullDesc,
                imageUrl,
            },
            include: {
                subCategories: true,
            },
        });
        res.status(201).json(mainCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create Category" });
    }
};
exports.createMainCategory = createMainCategory;
// Get All MainCategories
const getAllMainCategories = async (req, res) => {
    try {
        const mainCategories = await app_1.prisma.mainCategory.findMany({
            include: {
                subCategories: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
        res.status(200).json(mainCategories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch Categories" });
    }
};
exports.getAllMainCategories = getAllMainCategories;
// Get Single MainCategory
const getMainCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const mainCategory = await app_1.prisma.mainCategory.findUnique({
            where: { id },
            include: {
                subCategories: true,
            },
        });
        if (!mainCategory) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.status(200).json(mainCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch Category" });
    }
};
exports.getMainCategoryById = getMainCategoryById;
// Update MainCategory
const updateMainCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, shortDesc, fullDesc, imageUrl, status } = req.body;
    try {
        const mainCategory = await app_1.prisma.mainCategory.update({
            where: { id },
            data: {
                name,
                slug,
                shortDesc,
                fullDesc,
                imageUrl,
                status,
            },
            include: {
                subCategories: true,
            },
        });
        res.status(200).json(mainCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update Category" });
    }
};
exports.updateMainCategory = updateMainCategory;
// Delete MainCategory
const deleteMainCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await app_1.prisma.mainCategory.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete Category" });
    }
};
exports.deleteMainCategory = deleteMainCategory;
const createManyMainCategories = async (req, res) => {
    const { MainCategories } = req.body;
    try {
        const createdMainCategories = await Promise.all(MainCategories.map(async (mainCategory) => {
            const { SubCategories, ...mainCategoryData } = mainCategory;
            const createdMainCategory = await app_1.prisma.mainCategory.create({
                data: mainCategoryData,
            });
            if (SubCategories && SubCategories.length > 0) {
                const subCategoriesWithSlugs = await Promise.all(SubCategories.map(async (subCategory) => {
                    const uniqueSlug = subCategory.slug || await (0, slugify_1.generateUniqueSlug)(subCategory.name, 'subCategory');
                    return {
                        ...subCategory,
                        slug: uniqueSlug,
                        mainCategoryId: createdMainCategory.id,
                    };
                }));
                await app_1.prisma.subCategory.createMany({
                    data: subCategoriesWithSlugs,
                });
            }
            return createdMainCategory;
        }));
        res.status(201).json({
            message: "Main categories and subcategories created successfully",
            createdMainCategories,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create main categories and subcategories" });
    }
};
exports.createManyMainCategories = createManyMainCategories;
/**
 * Controller for SubCategory
 */
// Create SubCategory
const createSubCategory = async (req, res) => {
    const { name, slug, mainCategoryId, imageUrl } = req.body;
    const uniqueSlug = slug || await (0, slugify_1.generateUniqueSlug)(name, 'subCategory');
    try {
        const subCategory = await app_1.prisma.subCategory.create({
            data: {
                name,
                slug: uniqueSlug,
                mainCategoryId,
                imageUrl,
            },
            include: {
                mainCategory: true,
            },
        });
        res.status(201).json(subCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create SubCategory" });
    }
};
exports.createSubCategory = createSubCategory;
// Get All SubCategories
const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await app_1.prisma.subCategory.findMany({
            include: {
                mainCategory: true,
            },
        });
        res.status(200).json(subCategories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch SubCategories" });
    }
};
exports.getAllSubCategories = getAllSubCategories;
// Get Single SubCategory
const getSubCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const subCategory = await app_1.prisma.subCategory.findUnique({
            where: { id },
            include: {
                mainCategory: true,
            },
        });
        if (!subCategory) {
            res.status(404).json({ error: "SubCategory not found" });
            return;
        }
        res.status(200).json(subCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch SubCategory" });
    }
};
exports.getSubCategoryById = getSubCategoryById;
// Update SubCategory
const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { name, slug, mainCategoryId, imageUrl } = req.body;
    try {
        const subCategory = await app_1.prisma.subCategory.update({
            where: { id },
            data: {
                name,
                slug,
                mainCategoryId,
                imageUrl,
            },
            include: {
                mainCategory: true,
            },
        });
        res.status(200).json(subCategory);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update SubCategory" });
    }
};
exports.updateSubCategory = updateSubCategory;
// Delete SubCategory
const deleteSubCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await app_1.prisma.subCategory.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete SubCategory" });
    }
};
exports.deleteSubCategory = deleteSubCategory;
const createManySubCategories = async (req, res) => {
    const subCategories = req.body;
    try {
        const subCategoriesWithSlugs = await Promise.all(subCategories.map(async (subCategory) => {
            const uniqueSlug = subCategory.slug || await (0, slugify_1.generateUniqueSlug)(subCategory.name, 'subCategory');
            return {
                ...subCategory,
                slug: uniqueSlug,
            };
        }));
        const createdSubCategories = await app_1.prisma.subCategory.createMany({
            data: subCategoriesWithSlugs,
        });
        res.status(201).json({
            message: "Subcategories created successfully",
            createdSubCategories,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create subcategories" });
    }
};
exports.createManySubCategories = createManySubCategories;
