import { Router } from "express";
import { validateUser } from "../middlewares/validation.middleware.js";
import {
    loginUser, logoutUser, matchrefreshtoken, registerUser,
    uploadfile, changeCurrentPassword, getUserDetails,
    updateavatar,updateCoverimage
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

/**
 * user Router are here
 */
router.route("/register").post(validateUser, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware, logoutUser)
router.route("/upload-avatar").put(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 }
]), authMiddleware, uploadfile);
router.route("/refresh-token").post(matchrefreshtoken)
router.route("/change-password").put(authMiddleware, changeCurrentPassword);
router.route("/member").get(authMiddleware, getUserDetails);
router.route("/update-avatar").put(upload.single("avatar"), authMiddleware, updateavatar);
router.route("/update-coverimage").put(upload.single("coverimage"),authMiddleware,updateCoverimage)




export default router;