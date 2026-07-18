import Router from "express";
import { 
    deleteVideo, getvideobyId, publishAVideo,
    updateVideo, getallvideo
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
router.route("/delete-video/:id").delete(authMiddleware, deleteVideo);
router.route("/update-video/:id").put(upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), authMiddleware, updateVideo);
router.route("/allvideo").get(authMiddleware, getallvideo);
router.route("/:id").get(authMiddleware,getvideobyId);



export default router;