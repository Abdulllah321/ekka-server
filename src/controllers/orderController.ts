import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const {
      orderItems,
      totalAmount,
      selectedAddressId,
      selectedPaymentMethod,
      orderComment,
      expectedDeliveryDays = 7,
    } = req.body;

    let expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(
      expectedDeliveryDate.getDate() + expectedDeliveryDays
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(totalAmount),
        selectedAddressId,
        selectedPaymentMethod,
        orderComment,
        expectedDeliveryDate: expectedDeliveryDate,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        selectedAddress: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve order" });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                thumbnail: true,
                name: true,
              },
            },
          },
        },
        selectedAddress: true,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                thumbnail: true,
                name: true,
              },
            },
          },
        },
        selectedAddress: true,
      },
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
    console.log(error);
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.order.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

export const fetchOrderByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
    });
 
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by user ID" });
  }
};
