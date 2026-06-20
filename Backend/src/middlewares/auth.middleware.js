import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.js";
import User from "../models/user.models.js";

const authMiddleware = async (req,res,next) => {
    const token = req.cookies.refreshtoken;

    if(!token){
        throw new Apierror(401, "No token found");
    }

    const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);

    req.user = decodedToken;
    next();
}

export {authMiddleware};