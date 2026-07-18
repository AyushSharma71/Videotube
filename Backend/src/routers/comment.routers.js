import {Router} from "express";
import { 
    addComment,
    deleteComment,
    getVideoComments, 
    updateComment
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/getcomments/:videoId").get(authMiddleware,getVideoComments);
router.route("/addcomment/:videoId").post(authMiddleware,addComment);
router.route("/updatecomment/:commentId").patch(authMiddleware,updateComment)
router.route("/deletecomment/:commentId").delete(authMiddleware,deleteComment)


export default router;