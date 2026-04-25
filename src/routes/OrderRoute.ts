import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/OrderController";
import { generalLimiter, sensitiveLimiter } from "../middleware/rateLimiter";

const router = express.Router();
router.use(generalLimiter);

router.get("/", jwtCheck, jwtParse, OrderController.getOrders);

router.post(
    "/checkout/create-checkout-session",
    jwtCheck,
    jwtParse,
    sensitiveLimiter,
    OrderController.createCheckoutSession,
);

// router.post("/checkout/webhook", OrderController.stripeWebhookHandler);

export default router;
