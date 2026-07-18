import {Router} from "express";
import {authMiddleware } from "../middlewares/auth.middleware.js"
import {
     createTweet, 
     deleteTweet, 
     getUserTweets, 
     updateTweet
} from "../controllers/tweet.controller.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();


router.route("/createtweet").post(authMiddleware,upload.single("picture"),createTweet);
router.route("/updatetweet/:tweetId").put(authMiddleware,updateTweet);
router.route("/deletetweet/:tweetId").delete(authMiddleware,deleteTweet);
router.route("/gettweet/:userid").get(authMiddleware,getUserTweets)

export default router;