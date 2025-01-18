"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductBySlug = exports.getAllProducts = exports.createProduct = void 0;
const app_1 = require("../app");
const createProduct = async (req, res) => {
    const { name, slug, description, thumbnail, shortDesc, price, stockQuantity, sizes, colors, productTags, imageUrls, brand, discountPercentage, weight, dimensions, shippingFee, stockStatus, mainCategoryId, subCategoryId, userId, storeId, } = req.body;
    // Ensure numeric values are parsed correctly
    const parsedPrice = parseFloat(price);
    const parsedDiscountPercentage = discountPercentage
        ? parseFloat(discountPercentage)
        : 0;
    const parsedWeight = weight ? parseFloat(weight) : undefined;
    const parsedShippingFee = shippingFee ? parseFloat(shippingFee) : undefined;
    // Ensure stockQuantity is an integer
    const parsedStockQuantity = parseInt(stockQuantity, 10);
    const productTagsArray = Array.isArray(productTags)
        ? productTags // If it's already an array, use it as is
        : productTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== ""); // If it's a string, split and clean up
    // Calculate discountPrice based on discountPercentage and price
    const discountPrice = parsedPrice - (parsedPrice * parsedDiscountPercentage) / 100;
    try {
        const newProduct = await app_1.prisma.product.create({
            data: {
                name,
                slug,
                description,
                thumbnail,
                shortDesc,
                price: parsedPrice, // Make sure it's a number
                stockQuantity: parsedStockQuantity, // Ensure stockQuantity is an integer
                sizes,
                colors,
                productTags: productTagsArray,
                imageUrls,
                brand,
                discountPrice,
                weight: parsedWeight,
                dimensions,
                discountPercentage: parsedDiscountPercentage,
                shippingFee: parsedShippingFee,
                stockStatus,
                mainCategoryId,
                subCategoryId,
                userId,
                storeId,
            },
        });
        res.status(201).json(newProduct); // Send response back to the client
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Error creating product" }); // Handle errors gracefully
    }
};
exports.createProduct = createProduct;
// READ: Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await app_1.prisma.product.findMany({
            include: {
                mainCategory: true,
            },
        });
        res.status(200).json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching products" });
    }
};
exports.getAllProducts = getAllProducts;
// READ: Get product by ID
const getProductBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const product = await app_1.prisma.product.findUnique({
            where: { slug },
            include: {
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        productId: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profileImage: true,
                            },
                        },
                    },
                },
            },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        // Fetch related products based on mainCategoryId or subCategoryId
        const relatedProducts = await app_1.prisma.product.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { mainCategoryId: product.mainCategoryId },
                            { subCategoryId: product.subCategoryId },
                        ],
                    },
                    { id: { not: product.id } }, // Exclude the current product
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                discountPrice: true,
                rating: true,
                description: true,
                colors: true,
                sizes: true,
                imageUrls: true,
                mainCategoryId: true,
                subCategoryId: true,
                discountPercentage: true,
            },
            take: 5, // Limit the number of related products
        });
        const productData = { ...product, relatedProducts };
        res.status(200).json(productData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching product by slug" });
    }
};
exports.getProductBySlug = getProductBySlug;
// UPDATE: Update product by ID
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, slug, description, thumbnail, shortDesc, price, stockQuantity, sizes, colors, productTags, imageUrls, brand, weight, dimensions, shippingFee, stockStatus, mainCategoryId, subCategoryId, userId, discountPercentage, status, } = req.body;
    const parsedPrice = parseFloat(price);
    const parsedDiscountPercentage = discountPercentage
        ? parseFloat(discountPercentage)
        : 0;
    const discountPrice = parsedPrice - (parsedPrice * parsedDiscountPercentage) / 100;
    try {
        const updatedProduct = await app_1.prisma.product.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                thumbnail,
                shortDesc,
                price,
                stockQuantity,
                sizes,
                colors,
                productTags,
                imageUrls,
                brand,
                discountPrice,
                weight,
                dimensions,
                shippingFee,
                stockStatus,
                mainCategoryId,
                subCategoryId,
                userId,
                status,
                discountPercentage: parsedDiscountPercentage,
            },
        });
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating product" });
    }
};
exports.updateProduct = updateProduct;
// DELETE: Delete product by ID
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await app_1.prisma.product.delete({
            where: { id },
        });
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting product" });
    }
};
exports.deleteProduct = deleteProduct;
