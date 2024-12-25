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
  } = req.body;
  try {
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
      },
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
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
export const getCouponByCode = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.params;
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
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
