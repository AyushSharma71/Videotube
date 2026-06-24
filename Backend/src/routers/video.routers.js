import Router from "express";
import { 
    deleteVideo, getvidoebyId, publishAVideo,
    updateVideo
} from "../controllers/video.controller.js";
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
router.route("/delete-video/:id").post(deleteVideo);
router.route("/update-video/:id").put(upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]),updateVideo);
router.route("/:id").get(getvidoebyId);


export default router;