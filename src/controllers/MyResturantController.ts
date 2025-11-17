import { Request, Response } from "express";
import mongoose, { Mongoose } from "mongoose";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({
            userId: req.userId,
        });

        if (existingRestaurant) {
            return res
                .status(409)
                .json({ message: "Restaurant already exists" });
        }

        const image = req.file as Express.Multer.File;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = uploadResponse.url;
        restaurant.userId = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();
        await restaurant.save();

        res.status(201).send(restaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating restaurant" });
    }
};

export default {
    createMyRestaurant,
};
