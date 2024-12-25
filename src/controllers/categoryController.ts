import { Request, Response } from "express";
import { prisma } from "../app";
import { generateUniqueSlug } from '../utils/slugify';

export const createMainCategory = async (req: Request, res: Response) => {
  const { name, slug, shortDesc, fullDesc, imageUrl } = req.body;
  const uniqueSlug = slug || await generateUniqueSlug(name, 'mainCategory');

  try {
    const mainCategory = await prisma.mainCategory.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Category" });
  }
};

// Get All MainCategories
export const getAllMainCategories = async (req: Request, res: Response) => {
  try {
    const mainCategories = await prisma.mainCategory.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Categories" });
  }
};

// Get Single MainCategory
export const getMainCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const mainCategory = await prisma.mainCategory.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Category" });
  }
};

// Update MainCategory
export const updateMainCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, shortDesc, fullDesc, imageUrl, status } = req.body;
  try {
    const mainCategory = await prisma.mainCategory.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Category" });
  }
};

// Delete MainCategory
export const deleteMainCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.mainCategory.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete Category" });
  }
};

export const createManyMainCategories = async (req: Request, res: Response) => {
  const mainCategories = req.body;
  console.log(req.body);
  try {
    const createdMainCategories = await prisma.mainCategory.createMany({
      data: mainCategories,
    });

    res.status(201).json({
      message: "Main categories created successfully",
      createdMainCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create main categories" });
  }
};

/**
 * Controller for SubCategory
 */

// Create SubCategory
export const createSubCategory = async (req: Request, res: Response) => {
  const { name, slug, mainCategoryId, imageUrl } = req.body;
  const uniqueSlug = slug || await generateUniqueSlug(name, 'subCategory');

  try {
    const subCategory = await prisma.subCategory.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create SubCategory" });
  }
};

// Get All SubCategories
export const getAllSubCategories = async (req: Request, res: Response) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: {
        mainCategory: true,
      },
    });

    res.status(200).json(subCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch SubCategories" });
  }
};

// Get Single SubCategory
export const getSubCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const subCategory = await prisma.subCategory.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch SubCategory" });
  }
};

// Update SubCategory
export const updateSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, mainCategoryId, imageUrl } = req.body;

  try {
    const subCategory = await prisma.subCategory.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update SubCategory" });
  }
};

// Delete SubCategory
export const deleteSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.subCategory.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete SubCategory" });
  }
};

export const createManySubCategories = async (req: Request, res: Response) => {
  const subCategories = req.body;

  try {
    const subCategoriesWithSlugs = await Promise.all(
      subCategories.map(async (subCategory: { name: string; slug?: string; mainCategoryId: string; imageUrl?: string }) => {
        const uniqueSlug = subCategory.slug || await generateUniqueSlug(subCategory.name, 'subCategory');
        return {
          ...subCategory,
          slug: uniqueSlug,
        };
      })
    );

    const createdSubCategories = await prisma.subCategory.createMany({
      data: subCategoriesWithSlugs,
    });

    res.status(201).json({
      message: "Subcategories created successfully",
      createdSubCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create subcategories" });
  }
};
