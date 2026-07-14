import { Router } from "express";
import { 
    getSubscribedChannels,
    getUserChannelSubscribers, toggleSubscription 
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/subscribe/:channelId").post(authMiddleware,toggleSubscription);
router.route("/channelsubs/:channelId").get(getUserChannelSubscribers)
router.route("/user-subscribedChannels/:subscriberId").get(getSubscribedChannels)

export default router;