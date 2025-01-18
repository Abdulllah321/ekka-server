"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireCouponsMiddleware = exports.calculateCartTotals = void 0;
const app_1 = require("../app");
const calculateCartTotals = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const cart = await app_1.prisma.cart.findFirst({
            where: { userId },
            include: { cartItems: { include: { product: true } } },
        });
        if (cart) {
            const subtotal = cart.cartItems.reduce((sum, item) => sum + item.quantity * (item.product.price || 0), 0);
            // Calculate delivery charge (sum of product shipping fees or default to 100)
            const deliveryCharge = cart.cartItems.reduce((total, item) => total + (item.product.shippingFee || 100), 0);
            const totalAmount = subtotal + deliveryCharge;
            await app_1.prisma.cart.update({
                where: { id: cart.id },
                data: { subtotal, deliveryCharge, totalAmount },
            });
        }
        next();
    }
    catch (error) {
        console.error("Error in calculateCartTotals middleware:", error);
        res.status(500).json({ error: "Failed to calculate cart totals" });
    }
};
exports.calculateCartTotals = calculateCartTotals;
const expireCouponsMiddleware = async (req, res, next) => {
    try {
        const currentDate = new Date();
        // Update all coupons whose endDate has passed and are not already expired
        await app_1.prisma.coupon.updateMany({
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
    }
    catch (error) {
        console.error("Error expiring coupons:", error);
        res.status(500).json({ error: "Failed to process coupon expiration" });
    }
};
exports.expireCouponsMiddleware = expireCouponsMiddleware;
