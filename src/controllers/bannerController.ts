import { Request, Response } from "express";
import { prisma } from "../app";

export const createBanner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image, title, subtitle, discount, buttonText, animation,buttonUrl } =
      req.body;

    const banner = await prisma.banner.create({
      data: {
        image,
        title,
        subtitle,
        discount,
        buttonText,
        animation,buttonUrl
      },
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ error: "Failed to create banner" });
  }
};

// Get all banners
export const getAllBanners = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany();
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// Get a single banner by ID
export const getBannerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      res.status(404).json({ error: "Banner not found" });
      return;
    }

    res.status(200).json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ error: "Failed to fetch banner" });
  }
};

// Update a banner by ID
export const updateBanner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { image, title, subtitle, discount, buttonText, buttonUrl,animation } =
      req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        image,
        title,
        subtitle,
        discount,
        buttonText,buttonUrl,
        animation,
      },
    });

    res.status(200).json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Failed to update banner" });
  }
};

// Delete a banner by ID
export const deleteBanner = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
};
