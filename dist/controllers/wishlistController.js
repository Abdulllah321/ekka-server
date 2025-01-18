"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWishlist = exports.removeItemFromWishlist = exports.addItemsToWishlist = exports.createWishlist = exports.getWishlists = void 0;
const app_1 = require("../app");
const getWishlists = async (req, res) => {
    const userId = req.params.userId;
    try {
        const wishlists = await app_1.prisma.wishlist.findFirst({
            where: { userId },
            include: { wishlistItems: { include: { product: true } } },
        });
        res.status(200).json(wishlists?.wishlistItems || []);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wishlists" });
    }
};
exports.getWishlists = getWishlists;
const createWishlist = async (req, res) => {
    const userId = req.user?.id;
    const { itemId } = req.body;
    if (!userId) {
        res.status(400).json("User not found");
        return;
    }
    try {
        const existingWishlist = await app_1.prisma.wishlist.findFirst({
            where: { userId },
        });
        if (existingWishlist) {
            const updatedWishlist = await app_1.prisma.wishlist.update({
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
        }
        else {
            const wishlist = await app_1.prisma.wishlist.create({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create wishlist" });
    }
};
exports.createWishlist = createWishlist;
const addItemsToWishlist = async (req, res) => {
    const { wishlistId } = req.params;
    const { items } = req.body;
    try {
        const updatedWishlist = await app_1.prisma.wishlist.update({
            where: { id: wishlistId },
            data: {
                wishlistItems: {
                    create: items.map((item) => ({
                        productId: item.productId,
                    })),
                },
            },
            include: { wishlistItems: { include: { product: true } } },
        });
        res.status(200).json(updatedWishlist);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add items to wishlist" });
    }
};
exports.addItemsToWishlist = addItemsToWishlist;
const removeItemFromWishlist = async (req, res) => {
    const { itemId } = req.body;
    try {
        await app_1.prisma.wishlistItem.deleteMany({
            where: { productId: itemId },
        });
        res.status(200).json({ message: "Item removed from wishlist" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to remove item from wishlist" });
    }
};
exports.removeItemFromWishlist = removeItemFromWishlist;
const deleteWishlist = async (req, res) => {
    const { wishlistId } = req.params;
    try {
        await app_1.prisma.wishlist.delete({
            where: { id: wishlistId },
        });
        res.status(200).json({ message: "Wishlist deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete wishlist" });
    }
};
exports.deleteWishlist = deleteWishlist;
