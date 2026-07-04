import { Apierror } from "../utils/Apierror.js";
import subscription from "../models/subscription.models.js"

const subscribers = async(req,res) =>{
    try {
        
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message:error.message||"Internal server error"
        })
    }
}