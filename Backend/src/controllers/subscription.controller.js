import { Apierror } from "../utils/Apierror.js";
import { subscription } from "../models/subscription.models.js"
import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.models.js"

const toggleSubscription = async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!isValidObjectId(channelId)) {
            throw new Apierror(400, "Invalid channel id");
        }

        if (channelId === req.user.id) {
            throw new Apierror(400, "you can not subscribe to your own channel")
        }

        const existingsubs = await subscription.findOne({
            channel: channelId,
            subscriber: req.user.id,
        })

        if (existingsubs) {
            await subscription.findByIdAndDelete(existingsubs._id)

            return res.status(200).json({ message: "Unsubscribe successfully" });
        }

        await subscription.create({
            subscriber: req.user.id,
            channel: channelId,
        })

        return res.status(200).json({
            message: "Subscribed successfully"
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}
//  controller to return subscriber list of a channel
const getUserChannelSubscribers = async (req, res) => {
    try {
        const { channelId } = req.params;

        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "channelsubs",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "subscriber",
                                foreignField: "_id",
                                as: "subscriber",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            avatar: 1,
                                            fullname: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                subscriber: {
                                    $first: "$subscriber"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    subscribercount: {
                        $size: "$channelsubs"
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    avatar: 1,
                    subscribercount: 1,
                    channelsubs: 1
                }
            }
        ]);

        return res.status(200).json({
            message: "subscribers fetched successfully",
            subscriber: user[0]
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}
// controller to return channel list to which user has subscribed
const getSubscribedChannels = async (req, res) => {
    try {
        const { subscriberId } = req.params;

        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedto",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "channel",
                                foreignField: "_id",
                                as: "channelDetails",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            avatar: 1,
                                            fullname: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                channelDetails: {
                                    $first: "$channelDetails"
                                }
                            }
                        },
                        {
                            $project: {
                                subscriber: 1,
                                channel: 1,
                                channelDetails: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    channelDetails: {
                        $size: "$subscribedto"
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    avatar: 1,
                    subscribedto: 1,
                    channelDetails: 1
                }
            }
        ])
        
        return res.status(200).json({
            message:"Channel fetched successfully",
            channel:user[0]
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}