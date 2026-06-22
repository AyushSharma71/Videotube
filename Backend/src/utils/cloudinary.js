import dotenv from "dotenv";
dotenv.config({path:"./.env"});
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadImage = async (filepath) =>{
    try {
        const response = cloudinary.uploader.upload(filepath,{
            resource_type:"auto"
        })
        console.log("file uploaded successfully");
        return response;
    } catch (error) {
        if(filepath || fs.existsSync(filepath)){
            fs.unlinkSync(filepath)
        }
        console.log("Error in uploading file",error);
        throw error;
    }
}

const destroyImage = async (public_id) =>{
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log("previous deleted successfully");
    } catch (error) {
        console.log("Error in deleting file",error);
        throw error;
    }
}

export { uploadImage,destroyImage };