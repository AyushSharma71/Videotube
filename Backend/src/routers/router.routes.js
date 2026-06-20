import {Router} from "express";
import { validateUser } from "../middlewares/validation.middleware.js";
import { 
    loginUser, logoutUser, registerUser 
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";



const router = Router();


router.route("/register").post(validateUser,registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware,logoutUser)



export default router;