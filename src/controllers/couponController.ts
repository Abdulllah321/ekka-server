import { Request, Response } from "express";
import { prisma } from "../app";

// Create a new coupon
export const createCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    code,
    description,
    discountAmount,
    discountType,
    startDate,
    endDate,
    status,
    storeId,
    products,
  } = req.body;

  try {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      res.status(400).json({ error: "Coupon code already exists" });
      return;
    }

    const parsedDiscountAmount = parseInt(discountAmount);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountAmount: parsedDiscountAmount,
        discountType,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status,
        storeId,
        products: {
          connect: products.map((productId: string) => ({ id: productId })),
        },
      },
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    // Handle unique constraint error specifically
    if (error.code === "P2002" && error.meta.target.includes("code")) {
      res.status(400).json({ error: "Coupon code already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Get all coupons
export const getAllCoupons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.status(200).json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all coupons by store ID
export const getCouponsByStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { storeId } = req.params;
  try {
    const coupons = await prisma.coupon.findMany({
      where: { storeId },
      include: {
        products: {
          select: {
            name: true,
            id: true,
            thumbnail: true,
          },
        },
      },
    });
    if (coupons.length === 0) {
      res.status(404).json({ error: "No coupons found for the store" });
      return;
    }
    res.status(200).json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single coupon by ID
export const getCouponById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    res.status(200).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Get a single coupon by Code
export const getCouponByCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { code } = req.params;
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    const userCart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: { include: { product: { select: { id: true } } } },
      },
    });

    // Check if the cart has no items
    if (!userCart || userCart.cartItems.length === 0) {
      res
        .status(400)
        .json({ error: "Your cart is empty. Add items to apply the coupon." });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        products: {
          select: { id: true },
        },
      },
    });
    const cartIds = userCart.cartItems.map((item) => item.product.id);
    const couponProductIds = coupon?.products.map((product) => product.id);

    const isCouponApplicable = couponProductIds?.some((couponProductId) =>
      cartIds.includes(couponProductId)
    );

    if (!isCouponApplicable) {
      res.status(400).json({ error: "Coupon is not applicable to your cart." });
      return;
    }

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    if (coupon.status === "inactive") {
      res.status(400).json({ error: "Coupon is inactive" });
      return;
    }

    // Check if the coupon is expired
    const currentDate = new Date();
    if (
      (coupon.endDate && currentDate > new Date(coupon.endDate)) ||
      coupon.status === "expired"
    ) {
      res.status(400).json({ error: "Coupon has expired" });
      return;
    }

    // If the coupon is valid, return it
    res.status(200).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a coupon by ID
export const updateCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    code,
    description,
    discountAmount,
    discountType,
    startDate,
    endDate,
    status,
    products,
  } = req.body;
  const parsedDiscountAmount = parseInt(discountAmount);
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description,
        discountAmount: parsedDiscountAmount,
        discountType,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        status,
        products: {
          connect: products.map((productId: string) => ({ id: productId })),
        },
      },
    });
    res.status(200).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a coupon by ID
export const deleteCoupon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.coupon.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
