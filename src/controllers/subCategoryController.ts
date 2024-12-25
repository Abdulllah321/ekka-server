import { Request, Response } from "express";
import { prisma } from "../app";

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
