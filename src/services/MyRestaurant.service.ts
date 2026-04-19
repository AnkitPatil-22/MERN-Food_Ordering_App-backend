import cloudinary from "cloudinary";
import Restaurant from "../models/restaurant";
import mongoose from "mongoose";
import { Request, Response } from "express";

// Business Logic: Image Upload
export const uploadRestaurantImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};

// Database Logic: Find Restaurant
export const findRestaurantByUserId = async (userId: string) => {
    return await Restaurant.findOne({ userId });
};

// Business Logic: Create Restaurant
export const createRestaurant = async (
    userId: string,
    restaurantData: any,
    imageUrl: string,
) => {
    const restaurant = new Restaurant(restaurantData);
    restaurant.imageUrl = imageUrl;
    restaurant.userId = new mongoose.Types.ObjectId(userId);
    restaurant.lastUpdated = new Date();
    return await restaurant.save();
};

// services/myRestaurant.service.ts
interface UpdateRestaurantDTO {
    restaurantName: string;
    city: string;
    country: string;
    deliveryPrice: number;
    estimatedDeliveryTime: number;
    cuisines: string[];
    menuItems: any[]; // Ideally, use a proper interface for MenuItems
}

export const updateRestaurant = async (
    userId: string,
    updateData: UpdateRestaurantDTO,
    file?: Express.Multer.File,
) => {
    const restaurant = await findRestaurantByUserId(userId);

    if (!restaurant) {
        return null;
    }

    // Use Object.assign for a cleaner update, or keep explicit for clarity
    Object.assign(restaurant, updateData);

    restaurant.lastUpdated = new Date();

    if (file) {
        const imageUrl = await uploadRestaurantImage(file);
        restaurant.imageUrl = imageUrl;
    }

    return await restaurant.save();
};
