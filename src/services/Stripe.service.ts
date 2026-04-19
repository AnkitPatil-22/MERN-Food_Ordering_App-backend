import Stripe from "stripe";
import { MenuItemType } from "../models/restaurant";
import { CheckoutSessionRequest } from "../shared/types/checkout.types";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export const constructWebhookEvent = (payload: any, signature: string) => {
    return STRIPE.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_ENDPOINT_SECRET,
    );
};

export const createLineItems = (
    cartItems: CheckoutSessionRequest["cartItems"],
    menuItems: MenuItemType[],
) => {
    const lineItems = cartItems.map((cartItem) => {
        const menuItem = menuItems.find(
            (item) => item._id.toString() === cartItem.menuItemId.toString(),
        );

        if (!menuItem) {
            throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
        }

        const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
            price_data: {
                currency: "inr",
                unit_amount: menuItem.price,
                product_data: {
                    name: menuItem.name,
                },
            },
            quantity: parseInt(cartItem.quantity),
        };

        return line_item;
    });

    return lineItems;
};

export const createSession = async (
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId: string,
    deliveryPrice: number,
    restaurantId: string,
) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: deliveryPrice,
                        currency: "inr",
                    },
                },
            },
        ],
        mode: "payment",
        metadata: {
            orderId,
            restaurantId,
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });

    if (!sessionData.url) {
        throw new Error("Stripe failed to generate a redirect URL");
    }

    return sessionData;
};
