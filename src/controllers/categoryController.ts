import { Request, Response } from "express";
import { prisma } from "../app";

export const createMainCategory = async (req: Request, res: Response) => {
  const { name, slug, shortDesc, fullDesc, imageUrl } = req.body;

  try {
    const mainCategory = await prisma.mainCategory.create({
      data: {
        name,
        slug,
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

/**
 * Controller for SubCategory
 */

// Create SubCategory
export const createSubCategory = async (req: Request, res: Response) => {
  const { name, slug, mainCategoryId, imageUrl } = req.body;
  try {
    const subCategory = await prisma.subCategory.create({
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
