"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.updateCoupon = exports.getCouponByCode = exports.getCouponById = exports.getCouponsByStore = exports.getAllCoupons = exports.createCoupon = void 0;
const app_1 = require("../app");
// Create a new coupon
const createCoupon = async (req, res) => {
    const { code, description, discountAmount, discountType, startDate, endDate, status, storeId, products, } = req.body;
    try {
        const existingCoupon = await app_1.prisma.coupon.findUnique({
            where: { code },
        });
        if (existingCoupon) {
            res.status(400).json({ error: "Coupon code already exists" });
            return;
        }
        const parsedDiscountAmount = parseInt(discountAmount);
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const coupon = await app_1.prisma.coupon.create({
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
                    connect: products.map((productId) => ({ id: productId })),
                },
            },
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        // Handle unique constraint error specifically
        if (error.code === "P2002" && error.meta.target.includes("code")) {
            res.status(400).json({ error: "Coupon code already exists" });
        }
        else {
            res.status(500).json({ error: error.message });
        }
    }
};
exports.createCoupon = createCoupon;
// Get all coupons
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await app_1.prisma.coupon.findMany();
        res.status(200).json(coupons);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllCoupons = getAllCoupons;
// Get all coupons by store ID
const getCouponsByStore = async (req, res) => {
    const { storeId } = req.params;
    try {
        const coupons = await app_1.prisma.coupon.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCouponsByStore = getCouponsByStore;
// Get a single coupon by ID
const getCouponById = async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await app_1.prisma.coupon.findUnique({
            where: { id },
        });
        if (!coupon) {
            res.status(404).json({ error: "Coupon not found" });
            return;
        }
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCouponById = getCouponById;
// Get a single coupon by Code
const getCouponByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        const coupon = await app_1.prisma.coupon.findUnique({
            where: { code },
            include: {
                products: {
                    select: { id: true },
                },
            },
        });
        if (coupon?.storeId) {
            const userCart = await app_1.prisma.cart.findFirst({
                where: { userId },
                include: {
                    cartItems: { include: { product: { select: { id: true } } } },
                },
            });
            if (!userCart || userCart.cartItems.length === 0) {
                res.status(400).json({
                    error: "Your cart is empty. Add items to apply the coupon.",
                });
                return;
            }
            const cartIds = userCart.cartItems.map((item) => item.product.id);
            const couponProductIds = coupon?.products.map((product) => product.id);
            const isCouponApplicable = couponProductIds?.some((couponProductId) => cartIds.includes(couponProductId));
            if (!isCouponApplicable) {
                res
                    .status(400)
                    .json({ error: "Coupon is not applicable to your cart." });
                return;
            }
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
        if ((coupon.endDate && currentDate > new Date(coupon.endDate)) ||
            coupon.status === "expired") {
            res.status(400).json({ error: "Coupon has expired" });
            return;
        }
        // If the coupon is valid, return it
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCouponByCode = getCouponByCode;
// Update a coupon by ID
const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { code, description, discountAmount, discountType, startDate, endDate, status, products, } = req.body;
    const parsedDiscountAmount = parseInt(discountAmount);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    try {
        const coupon = await app_1.prisma.coupon.update({
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
                    connect: products.map((productId) => ({ id: productId })),
                },
            },
        });
        res.status(200).json(coupon);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateCoupon = updateCoupon;
// Delete a coupon by ID
const deleteCoupon = async (req, res) => {
    const { id } = req.params;
    try {
        await app_1.prisma.coupon.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteCoupon = deleteCoupon;
