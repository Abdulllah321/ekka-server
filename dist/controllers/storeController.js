"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreOrders = exports.getStoreProducts = exports.deleteStore = exports.updateStore = exports.getStoresByUser = exports.getStoreById = exports.getAllStores = exports.createStore = void 0;
const app_1 = require("../app");
// Create a new store
const createStore = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, slug, description, logo, bannerImage, contactEmail, contactPhone, address, themeColor, } = req.body;
        if (!userId)
            return;
        const store = await app_1.prisma.store.create({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create store",
            error: error.message,
        });
    }
};
exports.createStore = createStore;
// Get all stores
const getAllStores = async (req, res) => {
    try {
        const stores = await app_1.prisma.store.findMany({
            include: {
                products: true,
                coupons: true,
                orders: true,
            },
        });
        res.status(200).json({ success: true, data: stores });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch stores",
            error: error.message,
        });
    }
};
exports.getAllStores = getAllStores;
// Get a single store by ID
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await app_1.prisma.store.findUnique({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch store",
            error: error.message,
        });
    }
};
exports.getStoreById = getStoreById;
// Get stores by user
const getStoresByUser = async (req, res) => {
    try {
        const id = req.user?.id;
        const stores = await app_1.prisma.store.findMany({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch stores for user",
            error: error.message,
        });
    }
};
exports.getStoresByUser = getStoresByUser;
// Update a store
const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, logo, bannerImage, contactEmail, contactPhone, address, themeColor, status, returnPolicies, shippingPolicies, } = req.body;
        const store = await app_1.prisma.store.update({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update store",
            error: error.message,
        });
        console.log(error);
    }
};
exports.updateStore = updateStore;
// Delete a store
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        await app_1.prisma.store.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ success: true, message: "Store deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete store",
            error: error.message,
        });
    }
};
exports.deleteStore = deleteStore;
// Get all products for a store
const getStoreProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await app_1.prisma.product.findMany({
            where: { storeId: id },
        });
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch store products",
            error: error.message,
        });
    }
};
exports.getStoreProducts = getStoreProducts;
// Get all orders for a store
const getStoreOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await app_1.prisma.store.findUnique({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch store orders",
            error: error.message,
        });
    }
};
exports.getStoreOrders = getStoreOrders;
