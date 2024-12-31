import { Request, Response } from "express";
import { prisma } from "../app";

// Add product to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity, selectedColor, selectedSize } = req.body;
  const userId = req.user?.id;

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
      cart = await prisma.cart.create({
        data: {
          userId,
          cartItems: {
            create: [
              {
                productId,
                quantity,
                selectedColor,
                selectedSize,
              },
            ],
          },
        },
        include: { cartItems: { include: { product: true } } },
      });

      if (cart) {
        res.status(201).json(cart.cartItems[0]);
      } else {
        res.status(500).json({ error: "Failed to create cart" });
      }
      return;
    }

    const existingCartItem = cart.cartItems.find(
      (item) => item.productId === productId
    );

    if (existingCartItem) {
      res.status(500).json({ errors: "Product already in cart" });
      return;
    }

    // Add a new item to the existing cart
    const newCartItem = await prisma.cartItem.create({
      data: {
        productId,
        quantity,
        selectedColor,
        selectedSize,
        cartId: cart.id,
      },
      include: { product: true },
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const updateCartItemQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId, quantity } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(400).json({ error: "User not found" });
    return;
  }
  const parsedQuantity = parseInt(quantity);
  if (!productId || parsedQuantity === undefined || parsedQuantity < 0) {
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

    // Fetch the product to check available quantity
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check if the requested quantity exceeds the available quantity
    if (parsedQuantity > product.stockQuantity) {
      res.status(400).json({
        error: `Requested quantity exceeds available stock. Maximum quantity that can be ordered is ${product.stockQuantity}`,
      });
      return;
    }

    // Update the quantity or remove the item if the quantity is 0
    if (parsedQuantity > 0) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: parsedQuantity },
      });
      res.status(200).json(updatedCartItem);
    } else {
      res.status(400).json({ error: "Quantity should be greater than 0" });
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
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }
    const cartItem = cart.cartItems.find((item) => item.id === productId);

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
export const getCartItems = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    res.status(200).json(cart);
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

// Get the total count of items in the cart
export const getCartCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  try {
    // Find the user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      res.status(200).json({ count: 0 }); // No cart found, return 0
      return;
    }

    // Calculate the total number of items in the cart
    const totalCount = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({ count: totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart count" });
  }
};
