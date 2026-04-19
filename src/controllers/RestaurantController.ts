import { Request, Response } from "express";
import * as RestaurantService from "../services/Restaurant.service";

const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantId = req.params.restaurantId;

        const restaurant =
            await RestaurantService.getRestaurantById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.json(restaurant);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const city = req.params.city;
        const page = parseInt(req.query.page as string) || 1;

        const result = await RestaurantService.searchRestaurants({
            city,
            searchQuery: req.query.searchQuery as string,
            selectedCuisines: req.query.selectedCuisines as string,
            sortOption: req.query.sortOption as string,
            page,
        });

        // Handle No Results
        if (result.total === 0) {
            return res.status(404).json({
                data: [],
                pagination: { total: 0, page: 1, pages: 1 },
            });
        }

        // Success response
        const response = {
            data: result.data,
            pagination: {
                total: result.total,
                page: page,
                pages: result.pages,
            },
        };

        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default { searchRestaurant, getRestaurant };
