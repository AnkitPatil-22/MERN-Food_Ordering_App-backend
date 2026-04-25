import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import orderRoute from "./routes/OrderRoute";
import OrderController from "./controllers/OrderController";

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => console.log("Connected to database!"));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        exposedHeaders: [
            "Retry-After",
            "RateLimit-Limit",
            "RateLimit-Remaining",
        ],
    }),
);

app.post(
    "/api/order/checkout/webhook",
    express.raw({ type: "*/*" }),
    OrderController.stripeWebhookHandler,
);

app.set("trust proxy", 1);

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
});

app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/order", orderRoute);

// app.get("/test", async (req: Request, res: Response) => {
//     res.json({ message: "Hello!" });
// });

app.listen(7000, () => {
    console.log("🚀 Server running at http://localhost:7000");
});
