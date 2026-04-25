import express from "express";
import MyUserController from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";
import { generalLimiter, sensitiveLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.get(
    "/",
    jwtCheck,
    jwtParse,
    generalLimiter,
    MyUserController.getCurrentUser,
);
router.post(
    "/",
    jwtCheck,
    sensitiveLimiter,
    MyUserController.createCurrentUser,
);
router.put(
    "/",
    jwtCheck,
    jwtParse,
    validateMyUserRequest,
    sensitiveLimiter,
    MyUserController.updateCurrentUser,
);

export default router;
