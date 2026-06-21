import {Router} from "express";
import { validateUser } from "../middlewares/validation.middleware.js";
import { 
    loginUser, logoutUser, matchrefreshtoken, registerUser, 
    uploadfile
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

/**
 * user Router are here
 */
router.route("/register").post(validateUser,registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware,logoutUser)
router.route("/upload-avatar").put(upload.fields([
    {name :"avatar",maxCount:1},
    {name : "coverimage",maxCount:1}
]),authMiddleware,uploadfile);
router.route("/refresh-token").post(matchrefreshtoken)


export default router;