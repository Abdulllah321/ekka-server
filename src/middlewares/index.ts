import { Prisma } from "@prisma/client";
import { prisma } from "../app";
import { NextFunction, Request, Response } from "express";

export const calculateCartTotals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { cartItems: { include: { product: true } } },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    const subtotal = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity * (item.product.price || 0),
      0
    );

    // Calculate delivery charge (sum of product shipping fees or default to 100)
    const deliveryCharge = cart.cartItems.reduce(
      (total, item) => total + (item.product.shippingFee || 100),
      0
    );
    const totalAmount = subtotal + deliveryCharge;
    await prisma.cart.update({
      where: { id: cart.id },
      data: { subtotal, deliveryCharge, totalAmount },
    });
    next();
  } catch (error) {
    console.error("Error in calculateCartTotals middleware:", error);
    res.status(500).json({ error: "Failed to calculate cart totals" });
  }
};

export const expireCouponsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentDate = new Date();

    // Update all coupons whose endDate has passed and are not already expired
    await prisma.coupon.updateMany({
      where: {
        endDate: {
          lt: currentDate, // Coupons with endDate earlier than the current date
        },
        status: {
          not: "expired", // Only update coupons that are not already expired
        },
      },
      data: {
        status: "expired", // Update the status to "expired"
      },
    });

    next();
  } catch (error: any) {
    console.error("Error expiring coupons:", error);
    res.status(500).json({ error: "Failed to process coupon expiration" });
  }
};
