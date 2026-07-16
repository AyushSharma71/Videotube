import mongoose from "mongoose";
import { tweet } from "../models/tweets.models.js";
import { Apierror } from "../utils/Apierror.js";
import { destroyImage, uploadImage } from "../utils/cloudinary.js";
import User from "../models/user.models.js"
const createTweet = async (req, res) => {
    try {
        const userid = req.user.id;

        if (!userid) {
            throw new Apierror(401, "unauthorized")
        }

        const { content } = req.body;

        if (!content) {
            throw new Apierror(404, "content is required")
        }

        const Tweetcreated = await tweet.create({
            content: content,
            owner: userid,
        })

        if (!Tweetcreated) {
            throw new Apierror(400, "Tweet is not created")
        }

        if (req.file) {
            const picturelocalpath = req.file?.path || req.files?.picture?.[0]?.path;

            if (!picturelocalpath) {
                throw new Apierror(400, "Picture path is required")
            }

            const picturepath = await uploadImage(picturelocalpath)
            const pictureurl = picturepath?.secure_url || picturepath?.url

            const updatedTweet = await tweet.findByIdAndUpdate(
                Tweetcreated._id,
                {
                    picture: {
                        url: pictureurl,
                        picturePublicId: picturepath?.public_id,
                    }
                },
                { new: true, runValidators: true }
            )

            return res.status(200).json({
                message: "Tweet created successfully",
                Tweetcreated: updatedTweet
            })
        }

        return res.status(200).json({
            message: "Tweet created successfully",
            Tweetcreated
        })

    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const updateTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;

        if (!tweetId) {
            throw new Apierror(404, "tweetId is not found")
        }

        const { content } = req.body;

        if (!content) {
            throw new Apierror(404, "content is not found")
        }

        const updatedTweet = await tweet.findByIdAndUpdate(tweetId,
            {
                content: content
            },
            { new: true, runValidators: true }
        )

        if (!updatedTweet) {
            throw new Apierror(400, "tweet is not updated")
        }

        return res.status(200).json({
            message: "Tweet updated successfully",
            updatedTweet
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const deleteTweet = async (req, res) => {
    try {
        const { tweetId } = req.params

        if (!tweetId) {
            throw new Apierror(404, "Tweetid is not found")
        }

        const existingTweet = await tweet.findById(tweetId);

        if (!existingTweet) {
            throw new Apierror(404, "Tweet not found")
        }

        if (existingTweet.picture?.picturePublicId) {
            await destroyImage(existingTweet.picture.picturePublicId);
        }

        const deletedTweet = await tweet.findByIdAndDelete(tweetId);

        if (!deletedTweet) {
            throw new Apierror(400, "tweet is not deleted")
        }

        return res.status(200).json({
            message: "Tweet deleted successfully"
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const getUserTweets = async (req, res) => {
    try {
        const { userid } = req.params;

        if (!userid) {
            throw new Apierror(404, "userid is not found")
        }

        const tweetUserDetails = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "owner",
                    as: "tweetdetails",
                    pipeline: [
                        {
                            $project: {
                                content: 1,
                                picture: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    username: 1,
                    avatar: 1,
                    tweetdetails: 1
                }
            }
        ])

        const details = tweetUserDetails[0];

        if (!details) {
            throw new Apierror(404, "User not found")
        }

        return res.status(200).json({
            message: "Tweet fetched successfully",
            usertweets: details
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}
export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}