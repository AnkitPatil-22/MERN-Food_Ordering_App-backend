import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import * as OrderService from "../services/Order.service";
import * as StripeService from "../services/Stripe.service";
import * as RestaurantService from "../services/Restaurant.service";
import { CheckoutSessionRequest } from "../shared/types/checkout.types";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await OrderService.getOrdersByUser(req.userId);
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
    let event: Stripe.Event;
    console.log("Web Hook Completed!!!");

    try {
        const signature = req.headers["stripe-signature"] as string;
        event = StripeService.constructWebhookEvent(req.body, signature);
    } catch (error: any) {
        console.log(error);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type == "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        await OrderService.markOrderAsPaid(
            session.metadata?.orderId as string,
            session.amount_total as number,
        );
    }

    res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
    console.log("Order Placed!!!");
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;

        // 1. Validate Restaurant exists
        const restaurant = await RestaurantService.getRestaurantById(
            checkoutSessionRequest.restaurantId,
        );
        if (!restaurant)
            return res.status(404).json({ message: "Restaurant not found" });

        // 2. Create the internal Order record (Status: placed)
        const newOrder = await OrderService.createOrderRecord({
            restaurant: restaurant._id,
            user: req.userId,
            status: "placed",
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
        });

        // 3. Delegate Stripe work to the Stripe Service
        const lineItems = StripeService.createLineItems(
            checkoutSessionRequest.cartItems,
            restaurant.menuItems,
        );

        const session = await StripeService.createSession(
            lineItems,
            newOrder._id.toString(),
            restaurant.deliveryPrice,
            restaurant._id.toString(),
        );

        res.json({ url: session.url });
    } catch (error: any) {
        console.error("Payment Error:", error);

        // If it's a Stripe error, it will have the 'raw' object
        if (error.raw && error.raw.message) {
            return res.status(400).json({ message: error.raw.message });
        }

        // Fallback for non-Stripe errors (like database connection issues)
        res.status(500).json({ message: "An unexpected error occurred" });
    }
};

export default { createCheckoutSession, stripeWebhookHandler, getOrders };
