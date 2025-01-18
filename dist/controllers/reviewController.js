"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchReviewById = exports.getAllReviews = exports.deleteReview = exports.getReviewsByProduct = exports.createReview = void 0;
const app_1 = require("../app");
// Helper function to update product average rating
const updateProductRating = async (productId) => {
    const reviews = await app_1.prisma.review.findMany({
        where: { productId },
        select: { rating: true },
    });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    await app_1.prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating },
    });
};
// Create a new review
const createReview = async (req, res) => {
    const userId = req.user?.id;
    const { rating, comment, productId } = req.body;
    if (!rating || !productId || !userId) {
        res
            .status(400)
            .json({ error: "Rating, productId, and userId are required." });
        return;
    }
    try {
        const review = await app_1.prisma.review.create({
            data: {
                rating,
                comment,
                productId,
                userId,
            },
        });
        // Update the product's average rating
        await updateProductRating(productId);
        res.status(201).json(review);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create review." });
    }
};
exports.createReview = createReview;
// Get all reviews for a product
const getReviewsByProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const reviews = await app_1.prisma.review.findMany({
            where: { productId },
            include: { user: true },
        });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
};
exports.getReviewsByProduct = getReviewsByProduct;
// Delete a review
const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        const review = await app_1.prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            res.status(404).json({ error: "Review not found." });
            return;
        }
        await app_1.prisma.review.delete({
            where: { id },
        });
        // Update the product's average rating
        await updateProductRating(review.productId);
        res.status(200).json({ message: "Review deleted successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete review." });
    }
};
exports.deleteReview = deleteReview;
// Get all reviews
const getAllReviews = async (_req, res) => {
    try {
        const reviews = await app_1.prisma.review.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                    },
                },
            },
        });
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reviews." });
    }
};
exports.getAllReviews = getAllReviews;
// Get a single review by ID
const fetchReviewById = async (req, res) => {
    const { id } = req.params;
    try {
        const review = await app_1.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profileImage: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                    },
                },
            },
        });
        if (!review) {
            res.status(404).json({ error: "Review not found." });
            return;
        }
        res.status(200).json(review);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch review." });
    }
};
exports.fetchReviewById = fetchReviewById;
