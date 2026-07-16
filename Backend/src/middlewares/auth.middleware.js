import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.js";

const authMiddleware = async (req,res,next) => {
    try {
        const token = req.cookies.refreshtoken;

        if(!token){
            throw new Apierror(401, "No token found");
        }

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(error.statuscode || 401).json({
            message: error.message || "Unauthorized"
        });
    }
}

export {authMiddleware};