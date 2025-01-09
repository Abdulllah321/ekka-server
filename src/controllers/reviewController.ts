import { Request, Response } from "express";
import { prisma } from "../app";

// Helper function to update product average rating
const updateProductRating = async (productId: string): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { rating: averageRating },
  });
};

// Create a new review
export const createReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { rating, comment, productId } = req.body;

  if (!rating || !productId || !userId) {
    res
      .status(400)
      .json({ error: "Rating, productId, and userId are required." });
    return;
  }

  try {
    const review = await prisma.review.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create review." });
  }
};

// Get all reviews for a product
export const getReviewsByProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: true },
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
};

// Delete a review
export const deleteReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found." });
      return;
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update the product's average rating
    await updateProductRating(review.productId);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete review." });
  }
};
