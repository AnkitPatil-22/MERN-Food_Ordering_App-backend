import Order, { OrderStatus } from "../models/order";
import Restaurant from "../models/restaurant";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    placed: ["paid"],
    paid: ["inProgress"],
    inProgress: ["outForDelivery"],
    outForDelivery: ["delivered"],
    delivered: [],
};

export const getOrdersForRestaurant = async (restaurantId: string) => {
    return await Order.find({ restaurant: restaurantId })
        .populate("restaurant")
        .populate("user")
        .sort("-createdAt");
};

export const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    userId: string,
) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    // Cross-reference: Does the user own the restaurant associated with this order?
    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.userId?.toString() !== userId) {
        throw new Error("Unauthorized");
    }

    const currentStatus = order.status as OrderStatus;
    if (!VALID_TRANSITIONS[currentStatus].includes(status)) {
        throw new Error(
            `Invalid status transition from ${currentStatus} to ${status}`,
        );
    }

    order.status = status;
    await order.save();

    return order;
};

export const getOrdersByUser = async (userId: string) => {
    return await Order.find({ user: userId })
        .populate("restaurant")
        .populate("user")
        .sort("-createdAt");
};

export const createOrderRecord = async (orderData: any) => {
    const newOrder = new Order(orderData);
    await newOrder.save();
    return newOrder;
};

export const markOrderAsPaid = async (orderId: string, totalAmount: number) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "placed") {
        throw new Error("Order cannot be marked as paid in current state");
    }

    order.totalAmount = totalAmount;
    order.status = "paid";
    await order.save();

    return order;
};
