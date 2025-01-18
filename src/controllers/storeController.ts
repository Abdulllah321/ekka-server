import { Request, Response } from "express";
import { prisma } from "../app";

// Create a new store
export const createStore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      name,
      slug,
      description,
      logo,
      bannerImage,
      contactEmail,
      contactPhone,
      address,
      themeColor,
    } = req.body;

    if (!userId) return;

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        description,
        logo,
        bannerImage,
        contactEmail,
        contactPhone,
        address,
        ownerId: userId,
        themeColor,
      },
    });

    res.status(201).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create store",
      error: (error as any).message,
    });
  }
};

// Get all stores
export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: true,
        coupons: true,
        orders: true,
      },
    });

    res.status(200).json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: (error as any).message,
    });
  }
};

// Get a single store by ID
export const getStoreById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        products: true,
        coupons: true,
        orders: true,
      },
    });

    if (!store) {
      res.status(404).json({ success: false, message: "Store not found" });
      return;
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
      error: (error as any).message,
    });
  }
};

// Get stores by user
export const getStoresByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;

    const stores = await prisma.store.findMany({
      where: { ownerId: id },
      include: {
        products: true,
        coupons: true,
      },
    });

    if (!stores.length) {
      res
        .status(404)
        .json({ success: false, message: "No stores found for this user" });
      return;
    }

    res.status(200).json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores for user",
      error: (error as any).message,
    });
  }
};

// Update a store
export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      logo,
      bannerImage,
      contactEmail,
      contactPhone,
      address,
      themeColor,
      status,
      returnPolicies,
      shippingPolicies,
    } = req.body;

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        logo,
        bannerImage,
        contactEmail,
        contactPhone,
        address,
        themeColor,
        status,
        shippingPolicies,
        returnPolicies,
      },
    });

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: (error as any).message,
    });
    console.log(error);
  }
};

// Delete a store
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.store.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: (error as any).message,
    });
  }
};

// Get all products for a store
export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.findMany({
      where: { storeId: id },
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch store products",
      error: (error as any).message,
    });
  }
};

// Get all orders for a store
export const getStoreOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({
        success: false,
        message: "Store not found",
      });
      return;
    }

    res.status(200).json({ success: true, data: store.orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch store orders",
      error: (error as any).message,
    });
  }
};
