import { video } from "../models/video.model.js";
import { Apierror } from "../utils/Apierror.js"
import { uploadImage } from "../utils/cloudinary.js";


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

export {
    publishAVideo,
};