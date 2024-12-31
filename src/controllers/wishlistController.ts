// Import necessary modules
import { Request, Response } from "express";
import { prisma } from "../app";

export const getWishlists = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const wishlists = await prisma.wishlist.findFirst({
      where: { userId },
      include: { wishlistItems: { include: { product: true } } },
    });
    res.status(200).json(wishlists?.wishlistItems || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlists" });
  }
};

export const createWishlist = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { itemId } = req.body;
  if (!userId) {
    res.status(400).json("User not found");
    return;
  }

  try {
    const existingWishlist = await prisma.wishlist.findFirst({
      where: { userId },
    });

    if (existingWishlist) {
      const updatedWishlist = await prisma.wishlist.update({
        where: { id: existingWishlist.id },
        data: {
          wishlistItems: {
            create: {
              productId: itemId,
            },
          },
        },
        include: { wishlistItems: { include: { product: true } } },
      });
      res.status(200).json(updatedWishlist.wishlistItems || []);
    } else {
      const wishlist = await prisma.wishlist.create({
        data: {
          userId,
          wishlistItems: {
            create: {
              productId: itemId,
            },
          },
        },
        include: { wishlistItems: { include: { product: true } } },
      });
      res.status(201).json(wishlist.wishlistItems || []);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create wishlist" });
  }
};

export const addItemsToWishlist = async (req: Request, res: Response) => {
  const { wishlistId } = req.params;
  const { items } = req.body;

  try {
    const updatedWishlist = await prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        wishlistItems: {
          create: items.map((item: { productId: string }) => ({
            productId: item.productId,
          })),
        },
      },
      include: { wishlistItems: { include: { product: true } } },
    });
    res.status(200).json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to add items to wishlist" });
  }
};

export const removeItemFromWishlist = async (req: Request, res: Response) => {
  const { itemId } = req.body;

  try {
    await prisma.wishlistItem.deleteMany({
      where: { productId: itemId },
    });
    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item from wishlist" });
  }
};


export const deleteWishlist = async (req: Request, res: Response) => {
  const { wishlistId } = req.params;

  try {
    await prisma.wishlist.delete({
      where: { id: wishlistId },
    });
    res.status(200).json({ message: "Wishlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete wishlist" });
  }
};
