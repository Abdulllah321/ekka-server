import { Prisma, Product } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../app";

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
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
    discountPercentage,
    weight,
    dimensions,
    shippingFee,
    stockStatus,
    mainCategoryId,
    subCategoryId,
    userId,
  } = req.body;

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
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag !== ""); // If it's a string, split and clean up

  // Calculate discountPrice based on discountPercentage and price
  const discountPrice =
    parsedPrice - (parsedPrice * parsedDiscountPercentage) / 100;

  try {
    const newProduct = await prisma.product.create({
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
      },
    });

    res.status(201).json(newProduct); // Send response back to the client
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Error creating product" }); // Handle errors gracefully
  }
};

// READ: Get all products
export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products: Product[] = await prisma.product.findMany({
      include: {
        mainCategory: true,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching products" });
  }
};

// READ: Get product by ID
export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slug } = req.params;

  try {
    const product: Product | null = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching product by ID" });
  }
};

// UPDATE: Update product by ID
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
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
    weight,
    dimensions,
    shippingFee,
    stockStatus,
    mainCategoryId,
    subCategoryId,
    userId,
    discountPercentage,
  } = req.body;

  const parsedPrice = parseFloat(price);
  const parsedDiscountPercentage = discountPercentage
    ? parseFloat(discountPercentage)
    : 0;
  const discountPrice =
    parsedPrice - (parsedPrice * parsedDiscountPercentage) / 100;

  try {
    const updatedProduct: Product = await prisma.product.update({
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
        discountPercentage: parsedDiscountPercentage,
      },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
};

// DELETE: Delete product by ID
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting product" });
  }
};
