import {Router} from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getChannelStats,adminDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/get-dashboard").get(authMiddleware,getChannelStats);
router.route("/get-admin-dashboard").get(authMiddleware,adminDashboard);
export default router;