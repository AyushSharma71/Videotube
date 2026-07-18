import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { 
    getLikedVideos, toggleCommentsLike, toggleTweetLike, toggleVideoLike 
} from "../controllers/like.controller.js";


const router = Router();

router.route("/video-like/:videoId").post(authMiddleware,toggleVideoLike);
router.route("/comment-like/:commentId").post(authMiddleware,toggleCommentsLike);
router.route("/tweet-like/:tweetId").post(authMiddleware,toggleTweetLike);
router.route("/getlikedvideos").get(authMiddleware,getLikedVideos)


export default router;