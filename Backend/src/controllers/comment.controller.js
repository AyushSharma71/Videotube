import mongoose from "mongoose";
import { comment } from "../models/comments.models.js";
import { video } from "../models/video.model.js";
import { Apierror } from "../utils/Apierror.js"

const getVideoComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const agg = await comment.aggregate([
            {
                $match: { video: new mongoose.Types.ObjectId(videoId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "commenter"
                }
            },
            {
                $unwind: { path: "$commenter", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videodetails"
                }
            },
            {
                $unwind: { path: "$videodetails", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    commenter: {
                        username: "$commenter.username",
                        avatar: "$commenter.avatar"
                    },
                    videoDetails: {
                        videoFile: "$videodetails.videoFile",
                        title: "$videodetails.title",
                        description: "$videodetails.description"
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$video",
                    videoDetails: { $first: "$videoDetails" },
                    comments: {
                        $push: {
                            content: "$content",
                            commenter: "$commenter",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    videoDetails: 1,
                    comments: 1
                }
            }
        ]);

        if (!agg || agg.length === 0) {
            // no comments, still try to return video details
            const videoDoc = await video.findById(videoId).select("videoFile title description");
            return res.status(200).json({
                message: "video comments fetched successfully",
                result: {
                    videoDetails: videoDoc,
                    comments: []
                }
            })
        }

        const result = agg[0];
        return res.status(200).json({
            message: "video comments fetched successfully",
            result
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const addComment = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userid = req.user?.id;

        if (!videoId) {
            throw new Apierror(400, "videoId is required")
        }
        if (!userid) {
            throw new Apierror(401, "unauthorized")
        }
        const { content } = req.body;

        if (!content) {
            throw new Apierror(404, "content is required")
        }

        const usercomment = await comment.create({
            content: content,
            video: videoId,
            owner: userid
        })

        return res.status(200).json({
            message: "comment added successfully",
            usercomment
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            throw new Apierror(404, "commentid is required")
        }

        const content = req.body.content;

        if (!content) {
            throw new Apierror(404, "content is required")
        }

        const updatedcomment = await comment.findByIdAndUpdate(commentId,
            {
                content: content
            },
            { new: true, runValidators: true }
        )

        return res.status(200).json({
            message: "comment updated successfully",
            updatedcomment
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            throw new Apierror(404, "video is required")
        }

        const deletedComment = await comment.findByIdAndDelete(commentId);

        return res.status(200).json({
            message: "comment deleted successfully"
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}