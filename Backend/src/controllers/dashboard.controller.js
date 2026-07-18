import {video} from "../models/video.model.js"
import { Apierror } from "../utils/Apierror.js"
import { subscription } from "../models/subscription.models.js"
import { like } from "../models/like.models.js"
import { comment } from "../models/comments.models.js"
import mongoose from "mongoose";
import User from "../models/user.models.js";


const getChannelStats = async (req, res) => {
    try {
        const userId = req.user?.id;

        const stats = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videos",
                    pipeline: [
                        {
                            $lookup: {
                                from: "likes",
                                localField: "_id",
                                foreignField: "video",
                                as: "likes"
                            }
                        },
                        {
                            $lookup: {
                                from: "comments",
                                localField: "_id",
                                foreignField: "video",
                                as: "comments"
                            }
                        },
                        {
                            $addFields: {
                                likesCount: { $size: "$likes" },
                                commentsCount: { $size: "$comments" },
                                viewsCount: "$views"
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriptions"
                }
            },
            {
                $lookup: {
                    from:"tweets",
                    localField:"_id",
                    foreignField:"owner",
                    as:"tweets",
                    pipeline:[
                        {
                            $lookup:{
                                from:"likes",
                                localField:"_id",
                                foreignField:"tweet",
                                as:"tweetslikes"
                            }
                        },
                        {
                            $addFields:{
                                tweetslikesCount:{$size:"$tweetslikes"}
                            }   
                        }
                    ]
                }
            },
            {
                $lookup:{
                    from:"playlists",
                    localField:"_id",
                    foreignField:"owner",
                    as:"playlists",
                }
            },
            {
                $addFields: {
                    totalVideos: { $size: "$videos" },
                    totalSubscribers: { $size: "$subscribers" },
                    totalSubscriptions: { $size: "$subscriptions" },
                    totalLikes: { $sum: "$videos.likesCount" },
                    totalComments: { $sum: "$videos.commentsCount" },
                    totalViews: { $sum: "$videos.viewsCount" },
                    totalTweets: { $size: "$tweets" },
                    totalTweetsLikes: { $sum: "$tweets.tweetslikesCount" },
                    totalPlaylists: { $size: "$playlists" }
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                    totalVideos: 1,
                    totalSubscribers: 1,
                    totalSubscriptions: 1,
                    totalLikes: 1,
                    totalComments: 1,
                    totalViews: 1,
                    totalTweets: 1,
                    totalTweetsLikes: 1,
                    totalPlaylists: 1
                }
            }
        ]);

        if (!stats || stats.length === 0) {
            throw new Apierror(404, "Channel stats not found");
        }

        return res.status(200).json({
            message: "Channel stats fetched successfully",
            result: stats[0]
        });
    }catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const adminDashboard = async (req,res) =>{
    try {
        const admin = await User.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(req.user?.id),
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"_id",
                    foreignField:"owner",
                    as:"videos",
                    pipeline:[
                        {
                            $project:{
                                _id:0,
                                title:1,
                                description:1,
                                views:1,
                                videoFile:1,
                                thumbnail:1,
                            }
                        },
                        {
                            $sort:{
                                createdAt:-1
                            }
                        }
                    ]
                }               
            },
            {
                $project:{
                    _id:0,
                    username:1,
                    fullname:1,
                    avatar:1,
                    videos:1,
                }
            }
        ]);
        if(!admin || admin.length === 0){
            throw new Apierror(404,"admin not found");
        }
        return res.status(200).json({
            message:"admin dashboard fetched successfully",
            result:admin[0]
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message:error.message || "Internal server error"
        })
    }
}


export { getChannelStats, adminDashboard };

