"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getAllBanners = exports.createBanner = void 0;
const app_1 = require("../app");
const createBanner = async (req, res) => {
    try {
        const { image, title, subtitle, discount, buttonText, animation, buttonUrl } = req.body;
        const banner = await app_1.prisma.banner.create({
            data: {
                image,
                title,
                subtitle,
                discount,
                buttonText,
                animation, buttonUrl
            },
        });
        res.status(201).json(banner);
    }
    catch (error) {
        console.error("Error creating banner:", error);
        res.status(500).json({ error: "Failed to create banner" });
    }
};
exports.createBanner = createBanner;
// Get all banners
const getAllBanners = async (_req, res) => {
    try {
        const banners = await app_1.prisma.banner.findMany();
        res.status(200).json(banners);
    }
    catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ error: "Failed to fetch banners" });
    }
};
exports.getAllBanners = getAllBanners;
// Get a single banner by ID
const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await app_1.prisma.banner.findUnique({
            where: { id },
        });
        if (!banner) {
            res.status(404).json({ error: "Banner not found" });
            return;
        }
        res.status(200).json(banner);
    }
    catch (error) {
        console.error("Error fetching banner:", error);
        res.status(500).json({ error: "Failed to fetch banner" });
    }
};
exports.getBannerById = getBannerById;
// Update a banner by ID
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, title, subtitle, discount, buttonText, buttonUrl, animation } = req.body;
        const banner = await app_1.prisma.banner.update({
            where: { id },
            data: {
                image,
                title,
                subtitle,
                discount,
                buttonText, buttonUrl,
                animation,
            },
        });
        res.status(200).json(banner);
    }
    catch (error) {
        console.error("Error updating banner:", error);
        res.status(500).json({ error: "Failed to update banner" });
    }
};
exports.updateBanner = updateBanner;
// Delete a banner by ID
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await app_1.prisma.banner.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ error: "Failed to delete banner" });
    }
};
exports.deleteBanner = deleteBanner;
