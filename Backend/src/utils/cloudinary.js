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
        const response = await cloudinary.uploader.upload(filepath,{
            resource_type:"auto"
        });
        console.log("file uploaded successfully");
        return response;
    } catch (error) {
        try {
            if (filepath && fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (e) {
            console.log('Error cleaning up file after upload failure', e);
        }
        console.log("Error in uploading file", error);
        throw error;
    }
}

const destroyImage = async (public_id) =>{
    try {
        await cloudinary.uploader.destroy(public_id,
             { resource_type: "image" });

        console.log("Image deleted successfully",);
        
    } catch (error) {
        console.log("Error in deleting file",error);
        throw error;
    }
}

const destroyVideo = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(
            public_id,
            {
                resource_type: "video",
                invalidate: true   //cloudinary cdn or coached files mein se delete krne ke liye
            }
        );
        console.log("video deleted successfully");
        
    } catch (error) {
        console.log("Error deleting video", error);
        throw error;
    }
}

export { uploadImage,destroyImage,destroyVideo };