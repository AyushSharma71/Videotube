import mongoose from "mongoose";
import { like } from "../models/like.models.js";
import { Apierror } from "../utils/Apierror.js";

const toggleVideoLike = async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new Apierror(404, "videoId is required")
        }
        const existingvideolike = await like.findOne({
            video: videoId,
            likedBy: req.user?.id,
        })

        if (existingvideolike) {

            await like.findByIdAndDelete(existingvideolike?._id)
            return res.status(200).json({
                message: "video disliked successfully"
            })
        }

        const videoLiked = await like.create({
            video: videoId,
            likedBy: req.user?.id
        })

        return res.status(200).json({
            message: "video liked successfully",
            videoLiked
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }

}

const toggleCommentsLike = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            throw new Apierror(404, "commentId is required")
        }
        const existingcommentlike = await like.findOne({
            comment: commentId,
            likedBy: req.user?.id
        })

        if (existingcommentlike) {
            await like.findByIdAndDelete(existingcommentlike?._id)

            return res.status(200).json({
                message: "comment disliked successfully"
            })
        }

        const commentLiked = await like.create({
            comment: commentId,
            likedBy: req.user?.id
        })

        return res.status(200).json({
            message: "comment liked successfully",
            commentLiked
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}


const toggleTweetLike = async (req, res) => {
    try {
        const { tweetId } = req.params;
    
        if (!tweetId) {
            throw new Apierror(404, "tweetId is required")
        }
    
        const existingtweetlike = await like.findOne({
            tweet:tweetId,
            likedBy:req.user?.id,
        })
    
        if(existingtweetlike){
            await like.findByIdAndDelete(existingtweetlike?._id)
    
            return res.status(200).json({
                message:"Tweet disliked successfully"
            })
        }
    
        const tweetLiked = await like.create({
            tweet:tweetId,
            likedBy:req.user?.id
        })
    
        return res.status(200).json({
            message:"Tweet liked successfully",
            tweetLiked
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const getLikedVideos = async (req, res) => {
    try {
        const userid = req.user?.id;

        if (!userid) {
            throw new Apierror(401, "Unauthorized");
        }

        const likeVideosByUser = await like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userid),
                    video: { $exists: true, $ne: null }
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoDetails"
                }
            },
            {
                $unwind: {
                    path: "$videoDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "videoDetails.owner",
                    foreignField: "_id",
                    as: "videoOwner"
                }
            },
            {
                $unwind: {
                    path: "$videoOwner",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    likedBy: 1,
                    video: {
                        title: "$videoDetails.title",
                        description: "$videoDetails.description",
                        videoFile: "$videoDetails.videoFile",
                        thumbnail: "$videoDetails.thumbnail",
                        duration: "$videoDetails.duration",
                        views: "$videoDetails.views",
                        owner: {
                            _id: "$videoOwner._id",
                            username: "$videoOwner.username",
                            avatar: "$videoOwner.avatar"
                        }
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.status(200).json({
            message: "liked videos fetched successfully",
            likedVideos: likeVideosByUser
        });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        });
    }
};
export {
    toggleVideoLike,
    toggleCommentsLike,
    toggleTweetLike,
    getLikedVideos
}