import User from "../models/user.models.js";
import { video } from "../models/video.model.js";
import { Apierror } from "../utils/Apierror.js"
import { destroyImage, destroyVideo, uploadImage } from "../utils/cloudinary.js";


const publishAVideo = async (req, res) => {
    try {
        const userid = req.user?.id;
        const { title, description } = req.body;

        if (!title && !description) {
            throw new Apierror(400, "Title and Description are required");
        }

        const videoLocalpath = req.file?.path || req.files?.videoFile?.[0]?.path;

        if (!videoLocalpath) {
            throw new Apierror(400, "video file is not found");
        }

        const videoFile = await uploadImage(videoLocalpath);  
        const videoFileurl = videoFile?.secure_url || videoFile?.url || videoFile;
        const videoPublic_id = videoFile?.public_id;
        const thumbnailLocalpath = req.file?.path || req.files?.thumbnail?.[0]?.path;

        if (!thumbnailLocalpath) {
            throw new Apierror(400, "Thumbnail is not found");
        }

        const thumbnail = await uploadImage(thumbnailLocalpath);

        const thumbnailurl = thumbnail?.secure_url || thumbnail?.url;
        const thumbnailPublic_id = thumbnail?.public_id;
        const publishedvideo = await video.create({
            title,
            description,
            videoFile: {
                url: videoFileurl,
                videoPublicId: videoPublic_id
            },
            thumbnail: {
                url: thumbnailurl,
                thumbnailPublicId: thumbnailPublic_id,
            },
            owner: userid,
        })

        if (!publishedvideo) {
            throw new Apierror(400, "video is not created");
        }
        return res.status(200).json({
            message:"video uploaded successfully",
            publishedvideo,
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteVideo = async (req,res) =>{
    try {
        const videoId = req.params.id;
        if(!videoId){
            throw new Apierror(404,"videoID is not found");
        }

        const videos = await video.findById(videoId);

        if(!videos){
            throw new Apierror(404,"video is not found");
        }

        await destroyVideo(videos.videoFile?.videoPublicId);
        await destroyImage(videos.thumbnail?.thumbnailPublicId);

        const deletedvideo = await video.findByIdAndDelete(videoId);

        if(!deletedvideo){
            throw new Apierror(400,"video is not deleted");
        }
        return res.status(200).json({
            message:"video deleted successfully"
        })
    } catch (error) {
        res.status(error.statuscode||500).json({
            message:error.message||"internal server error",
        })
    }
}

const updateVideo = async(req,res)=>{
    try {
        const videoId =req.params.id;
        if(!videoId){
            throw new Apierror(404,"videoId is not found");
        }
        const videos = await video.findById(videoId);
        if(!videos){
            throw new Apierror(404,"video  is not found");
        }
    
        const videoFileLocalPath = req.file?.path || req.files?.videoFile?.[0]?.path;
        console.log(videoFileLocalPath)
        if(!videoFileLocalPath){
            throw new Apierror(404,"videoFile path is not found")
        }
        await destroyVideo(videos.videoFile?.videoPublicId);
        const videoFile = await uploadImage(videoFileLocalPath)
        const videofileurl = videoFile?.secure_url || videoFile?.url || videoFile;
        const videoFilePublic_id = videoFile?.public_id;
    
        const thumbnailLocalPath = req.file?.path || req.files?.thumbnail?.[0]?.path;
        if(!thumbnailLocalPath){
            throw new Apierror(404,"Thumbnail not found")
        }
    
        await destroyImage(videos.thumbnail?.thumbnailPublicId);
        const thumbnail = await uploadImage(thumbnailLocalPath);
        const thumbnailurl = thumbnail?.secure_url || thumbnail?.url ||thumbnail;
        const thumbnailPublic_id = thumbnail?.public_id;
        const updatedvideo = await video.findByIdAndUpdate(videoId,
            {
                videoFile:{
                    url:videofileurl,
                    videoPublicId:videoFilePublic_id,
                },
                thumbnail:{
                    url:thumbnailurl,
                    thumbnailPublicId:thumbnailPublic_id
                },
            },
            {new:true,runValidators:true}
        )
    
        if(!updatedvideo){
            throw new Apierror(400,"Video is not updated");
        }
        return res.status(200).json({
            message:"video updated successfully"
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message:error.message || "internal server error"
        })
    }
}

const getvidoebyId = async (req,res) =>{
    try {
        const videoid = req.params.id;
    
        if(!videoid){
            throw new Apierror(404,"videoid is not found");
        }
        
        const videos = await video.findById(videoid)
    
        if(!videos){
            throw new Apierror(404,"video is not found");
        }
        return res.status(200).json({
            videos
        })
    } catch (error) {
        res.status(error.statuscode||500).json({
            message:error.message||"Internal server error"
        })
    }
}


// todo :- getallvideo,togglevideo
export {
    publishAVideo,
    deleteVideo,
    updateVideo,
    getvidoebyId
};