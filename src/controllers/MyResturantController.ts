import { Request, Response } from "express";
import * as RestaruantServie from "../services/MyRestaurant.service";
import * as OrderService from "../services/Order.service";
import { OrderStatus } from "../models/order";

const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await RestaruantServie.findRestaurantByUserId(
            req.userId,
        );
        if (!restaurant) {
            return res.status(404).json({ message: "Restaruant not found " });
        }
        res.json(restaurant);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error fetching restaurant" });
    }
};

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant =
            await RestaruantServie.findRestaurantByUserId(req.userId);

        if (existingRestaurant) {
            return res
                .status(409)
                .json({ message: "Restaurant already exists" });
        }

        const imageUrl = await RestaruantServie.uploadRestaurantImage(
            req.file as Express.Multer.File,
        );

        const restaurant = await RestaruantServie.createRestaurant(
            req.userId,
            req.body,
            imageUrl,
        );

        res.status(201).send(restaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating restaurant" });
    }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await RestaruantServie.updateRestaurant(
            req.userId,
            req.body,
            req.file,
        );

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).send(restaurant);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error updating restaurant" });
    }
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await RestaruantServie.findRestaurantByUserId(
            req.userId,
        );
        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found" });
        }

        const orders = await OrderService.getOrdersForRestaurant(
            restaurant._id.toString(),
        );

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
};

const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId;
        const status = req.body.status;

        const updatedOrder = await OrderService.updateOrderStatus(
            orderId,
            status as OrderStatus,
            req.userId,
        );

        res.status(200).json(updatedOrder);
    } catch (error: any) {
        console.log(error);
        if (error.message === "Order not found")
            return res.status(404).json({ message: error.message });
        if (error.message === "Unauthorized")
            return res
                .status(401)
                .json({ message: "Not authorized to update this order" });
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default {
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
    getMyRestaurantOrders,
    updateOrderStatus,
};
