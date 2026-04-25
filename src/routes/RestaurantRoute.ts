import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";
import { generalLimiter, searchLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.get(
    "/:restaurantId",
    param("city")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("RestaurantId paramenter must be a valid string"),
    generalLimiter,
    RestaurantController.getRestaurant,
);

router.get(
    "/search/:city",
    param("city")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("City paramenter must be a valid string"),
    searchLimiter,
    RestaurantController.searchRestaurant,
);

export default router;
