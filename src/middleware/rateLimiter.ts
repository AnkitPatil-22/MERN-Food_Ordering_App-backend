import rateLimit from "express-rate-limit";

/**
 * A helper function to create consistent limiters across the app.
 * DRY (Don't Repeat Yourself) principle.
 */
const createLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true, // Sends RateLimit-Limit and RateLimit-Remaining
        legacyHeaders: false,
        message: { message },

        // CONCEPT 1: DYNAMIC KEY GENERATION
        // Prioritize the User ID if logged in, otherwise fall back to IP.
        keyGenerator: (req: any) => {
            return req.userId || req.ip;
        },

        // CONCEPT 2: ENVIRONMENT SKIPPING
        // Don't block ourselves on localhost or during automated tests.
        skip: (req) => {
            return (
                process.env.NODE_ENV === "test" ||
                req.ip === "127.0.0.1" ||
                req.ip === "::1"
            );
        },

        // CONCEPT 4: CONSOLIDATED LOGGING
        // Pipes rate-limit events into Winston instead of just console.log.
        handler: (req: any, res, next, options) => {
            console.warn(
                `Rate Limit Hit: ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.userId || "Guest"}`,
            );
            res.status(options.statusCode).json(options.message);
        },
    });
};

// --- DEFINITIONS ---

// 1. Search: High frequency, but expensive DB queries.
export const searchLimiter = createLimiter(
    1 * 60 * 1000, // 1 minute
    60,
    "You're searching a bit too fast! Please wait a moment.",
);

// 2. General: For browsing restaurant profiles or user data.
export const generalLimiter = createLimiter(
    15 * 60 * 1000, // 15 minutes
    100,
    "Too many requests from this account. Please try again in 15 minutes.",
);

// 3. Sensitive: For payments and account creation (Prevents bots/fraud).
export const sensitiveLimiter = createLimiter(
    60 * 60 * 1000, // 1 hour
    20,
    "Action limit reached. For security, please try again in an hour.",
);
