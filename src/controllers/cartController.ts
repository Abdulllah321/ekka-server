import { Request, Response } from "express";
import { prisma } from "../app";

// Add product to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id; // Assuming the user ID is available in the request (authenticated user)
  if (!userId) {
    res.status(400).json("User not found");
    return;
  }
  try {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      // Create a new cart if the user doesn't have one
      cart = await prisma.cart.create({
        data: {
          userId,
          cartItems: {
            create: [
              {
                productId,
                quantity,
              },
            ],
          },
        },
        include: { cartItems: true },
      });
    } else {
      // Check if the product already exists in the cart
      const existingCartItem = cart.cartItems.find(
        (item) => item.productId === productId
      );

      if (existingCartItem) {
        // Update the quantity of the existing cart item
        const updatedCartItem = await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
        res.status(200).json(updatedCartItem);
        return;
      }

      // Add a new item to the cart
      const newCartItem = await prisma.cartItem.create({
        data: {
          productId,
          quantity,
          cartId: cart.id,
        },
      });
      res.status(201).json(newCartItem);
      return;
    }

    res.status(500).json({ error: "Failed to add to cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const updateCartItemQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id; // Assuming the user ID is available in the request (authenticated user)

  if (!userId) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  if (!productId || typeof quantity !== "number") {
    res.status(400).json({ error: "Invalid product ID or quantity" });
    return;
  }

  try {
    // Find the user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    // Find the cart item to update
    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId
    );

    if (!existingCartItem) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    // Update the quantity or remove the item if the quantity is 0
    if (quantity > 0) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity },
      });
      res.status(200).json(updatedCartItem);
    } else {
      await prisma.cartItem.delete({
        where: { id: existingCartItem.id },
      });
      res.status(200).json({ message: "Cart item removed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update cart item quantity" });
  }
};

// Remove product from cart
export const removeFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.body;
  const userId = req.user?.id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId }, // Use findFirst instead of findUnique
      include: { cartItems: true },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    const cartItem = cart.cartItems.find(
      (item) => item.productId === productId
    );

    if (!cartItem) {
      res.status(404).json({ error: "Product not found in cart" });
      return;
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};

// Get all items in the cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId }, // Use findFirst instead of findUnique
      include: {
        cartItems: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    res.status(200).json(cart.cartItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};

// Clear the cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId }, // Use findFirst instead of findUnique
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
