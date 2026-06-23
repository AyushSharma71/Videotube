import Router from "express";
import { publishAVideo } from "../controllers/video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
/**
 * video routers are here
 */
router.route("/publish-video").post(upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), authMiddleware, publishAVideo);




export default router;