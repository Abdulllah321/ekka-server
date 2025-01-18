"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrderByUser = exports.deleteOrder = exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.createOrder = void 0;
const app_1 = require("../app");
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }
        const { orderItems, totalAmount, selectedAddressId, selectedPaymentMethod, orderComment, expectedDeliveryDays = 7, storeIds } = req.body;
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            res.status(400).json({ error: "Order items are required" });
            return;
        }
        if (!Array.isArray(storeIds) || storeIds.length === 0) {
            res.status(400).json({ error: "At least one store ID is required" });
            return;
        }
        if (!totalAmount || isNaN(parseFloat(totalAmount))) {
            res.status(400).json({ error: "Valid total amount is required" });
            return;
        }
        if (!selectedAddressId) {
            res.status(400).json({ error: "Selected address ID is required" });
            return;
        }
        if (!selectedPaymentMethod) {
            res.status(400).json({ error: "Selected payment method is required" });
            return;
        }
        let expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + expectedDeliveryDays);
        // Create the order
        const order = await app_1.prisma.order.create({
            data: {
                userId,
                totalAmount: parseFloat(totalAmount),
                selectedAddressId,
                selectedPaymentMethod,
                orderComment,
                expectedDeliveryDate,
                orderItems: {
                    create: orderItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
                stores: {
                    connect: storeIds.map((storeId) => ({ id: storeId })),
                },
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};
exports.createOrder = createOrder;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await app_1.prisma.order.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve order" });
    }
};
exports.getOrderById = getOrderById;
const getAllOrders = async (req, res) => {
    try {
        const orders = await app_1.prisma.order.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to retrieve orders" });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await app_1.prisma.order.update({
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update order status" });
        console.log(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await app_1.prisma.order.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
};
exports.deleteOrder = deleteOrder;
const fetchOrderByUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        const orders = await app_1.prisma.order.findMany({
            where: { userId },
            include: { orderItems: { include: { product: true } } },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products by user ID" });
    }
};
exports.fetchOrderByUser = fetchOrderByUser;
