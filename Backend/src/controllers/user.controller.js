import { Apierror } from "../utils/Apierror.js";
import User from "../models/user.models.js";
import cookieparser from "cookie-parser";
import jwt from "jsonwebtoken";
import { uploadImage, destroyImage } from "../utils/cloudinary.js";
import mongoose from "mongoose";
const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessTokenAndRefreshToken = async function (userid) {
    try {
        const user = await User.findById(userid)
        const refreshtoken = await user.generateRefreshToken();
        const accesstoken = await user.generateAccessToken();
        user.refreshToken = refreshtoken;
        await user.save({ validateBeforeSave: false });

        return { accesstoken, refreshtoken };
    } catch (error) {
        throw new Apierror(error.statuscode, error.message);
    }
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullname } = req.body;

        if ([username, fullname, email, password].some((field) =>
            field?.trim() === ""
        )) {
            throw new Apierror(400, "All fields are required");
        }

        const existeduser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existeduser) {
            throw new Apierror(403, "user already exists");
        }

        const createduser = await User.create({
            fullname,
            email,
            password,
            username: username.trim().toLowerCase(),
        })

        if (!createduser) {
            throw new Apierror(400, "user is not created");
        }

        return res.status(200).json({ message: "user created successfully" });
    }
    catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error"
        })
    }
}

const loginUser = async (req, res) => {

    try {
        const { username, password } = req.body;

        const userexists = await User.findOne({ username: username.trim().toLowerCase() });


        if (!userexists) {
            throw new Apierror(400, "user does not exist");
        }

        const decodedpassword = await userexists.isPasswordCorrect(password);

        if (!decodedpassword) {
            throw new Apierror(403, "Invalid credentials");
        }
        // if (decodedpassword) {
        //     const accesstoken = jwt.sign(
        //         {
        //             id: userexists._id,
        //             fullname: userexists.fullname,
        //             username: userexists.username
        //         }, process.env.ACCESS_TOKEN_SECRET,
        //         {
        //             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        //         }
        //     )
        //     const refreshtoken = jwt.sign(
        //         {
        //             id: userexists._id
        //         }, process.env.REFRESH_TOKEN_SECRET,
        //         {
        //             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        //         }
        //     )
        //     userexists.refreshToken = refreshtoken;
        //     await userexists.save({ validateBeforeSave: false });
        if (decodedpassword) {
            const { accesstoken, refreshtoken } = await generateAccessTokenAndRefreshToken(userexists?._id);

            res
                .cookie("refreshtoken", refreshtoken, options)
                .cookie("accesstoken", accesstoken, options);

            return res.status(200).json({
                message: "Login successful",
                accesstoken
            })
        }
    } catch (error) {
        res.status(error.statuscode || 500)
            .json({ message: error.message || "Internal server error" })
    }
}

const matchrefreshtoken = async (req, res) => {
    /**
     * first collect the token from cookies.
     * decode the token ->if not same ->logout user
     * database ke refreshtoken se compare kro
     * same ->new accesstoken create kro 
     */

    try {
        const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken;

        if (!incomingrefreshtoken) {
            throw new Apierror(401, "unauthorized");
        }

        const decodedToken = await jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedToken?.id)

        if (incomingrefreshtoken !== user.refreshToken) {
            throw new Apierror(401, "Invalid refresh token");
        }

        const { refreshtoken: newrefreshtoken, accesstoken } = await generateAccessTokenAndRefreshToken(user?._id);

        res.cookie("accesstoken", accesstoken, options)
            .cookie("refreshtoken", newrefreshtoken, options);

        return res.status(200).json({
            message: "Access token refreshed",
            accesstoken,
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const userid = req.user.id;

        if (!userid) {
            throw new Apierror(403, "unauthorized user");
        }

        const user = await User.findByIdAndUpdate(userid,
            {
                $unset: { refreshToken: true }
            },
            { new: true },
        )
        await user.save({ validateBeforeSave: false });

        res.clearCookie("accesstoken", options)
            .clearCookie("refreshtoken", options);


        return res.status(200).json({ message: "logout successfully" });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const uploadfile = async (req, res) => {
    try {
        const userid = req.user?.id;

        const avatarLocalpath = req.file?.path || req.files?.avatar?.[0]?.path;

        if (!avatarLocalpath) {
            throw new Apierror(400, "avatar is required");
        }

        const avatar = await uploadImage(avatarLocalpath);
        const avatarurl = avatar?.secure_url || avatar?.url || avatar;
        const avatarid = avatar?.public_id


        const coverimagepath = req.file?.path || req.files?.coverimage?.[0]?.path;

        if (!coverimagepath) {
            throw new Apierror(400, "coverimage path is required");
        }

        const coverimage = await uploadImage(coverimagepath);
        const coverimageurl = coverimage?.secure_url || coverimage?.url || coverimage;
        const coverimageid = coverimage?.public_id
        const updateduser = await User.findByIdAndUpdate(userid,
            {
                avatar: {
                    url: avatarurl,
                    avatarpublic_id: avatarid
                },
                coverimage: {
                    url: coverimageurl,
                    coverpublic_id: coverimageid
                }
            },
            { new: true, runValidators: true }
        )

        const user = await User.findById(userid).select("-password -refreshToken")

        return res.status(200).json({
            message: "files are uploaded successfully",
            user,
        })
    } catch (error) {
        throw new Apierror(500, "internal server in file uploading");
    }
}

const changeCurrentPassword = async (req, res) => {
    try {
        const { oldpassword, newpassword } = req.body;

        if (oldpassword === newpassword) {
            throw new Apierror(400, "olpassword and newpassword can not be same");
        }

        const user = await User.findById(req.user?.id);
        const verifypassword = await user.isPasswordCorrect(oldpassword);

        if (!verifypassword) {
            throw new Apierror(400, "wrong password entered");
        }

        user.password = newpassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "password changed successfully" });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id).select("-password -refreshToken");

        return res.status(200).json({ user });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const updateavatar = async (req, res) => {
    try {
        const userid = req.user?.id;
        const user = await User.findById(userid);

        if (!user) {
            throw new Apierror(404, "user not found")
        }

        const avatarLocalpath = req.file?.path || req.files?.avatar?.[0]?.path;

        if (!avatarLocalpath) {
            throw new Apierror(400, "avatar is required");
        }

        /*if(user.avatar?.avatarpublic_id){
            await cloudinary.uploader.destroy(
                user.avatar.avatarpublic_id
            )
        }*/

        const avatar = await uploadImage(avatarLocalpath);
        await destroyImage(user.avatar?.avatarpublic_id);

        const avatarurl = avatar?.secure_url || avatar?.url || avatar;

        user.avatar = {
            url: avatarurl,
            avatarpublic_id: avatar?.public_id
        };
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "avatar changed successfully" });
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const updateCoverimage = async (req, res) => {
    try {
        const userid = req.user?.id;
        const user = await User.findById(userid);

        if (!user) {
            throw new Apierror(404, "user not found");
        }

        const coverimageLocalpath = req.file?.path || req.files?.coverimage?.[0]?.path;

        if (!coverimageLocalpath) {
            throw new Apierror(402, "coverimage is required");
        }
        const coverimage = await uploadImage(coverimageLocalpath);
        await destroyImage(user.coverimage?.coverpublic_id);

        const coverimageurl = coverimage?.secure_url || coverimage?.url || coverimage;

        user.coverimage = {
            url: coverimageurl,
            coverpublic_id: coverimage?.public_id
        };
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ message: "coverimage changed successfully" });

    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "Internal server error",
        })
    }
}

const updatedetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullname, username, email } = req.body;

        if (!(fullname || username || email)) {
            throw new Apierror(400, "At least one field (fullname, username, or email) is required")
        }

        const updateduser = await User.findByIdAndUpdate(userId,
            {
                fullname: fullname,
                email: email,
                username: username,
            },
            { new: true, runValidators: true }
        )
        if (!updateduser) {
            throw new Apierror(400, "user is not updated");
        }
        return res.status(200).json({
            message: "updated successfully"
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const getUserChannelProfile = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username?.trim()) {
            throw new Apierror(404, "username is not found")
        }

        const channel = await User.aggregate([
            // for getting subscribers 
            {
                $match: {
                    username: username?.toLowerCase()
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
            // for getting subscribed other channels
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedto"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelSubscribedto: {
                        $size: "$subscribedto"
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false,
                        }
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    fullname: 1,
                    subscribersCount: 1,
                    channelSubscribedto: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverimage: 1
                }
            }
        ])

        if (!channel?.length) {
            throw new Apierror(404, "channel does not exists")
        }

        return res.status(200).json({
            message: "channel profile fetched successfully",
            channel: channel[0]
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

const watchHistory = async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?.id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner"
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ]
                }
            },
        ])

        return res.status(200).json({
            message:"Watch history fetched successfully",
            watchHistory:user[0].watchHistory,
        })
    } catch (error) {
        res.status(error.statuscode || 500).json({
            message: error.message || "internal server error"
        })
    }
}

export {
    registerUser,
    loginUser,
    logoutUser,
    uploadfile,
    changeCurrentPassword,
    matchrefreshtoken,
    updateavatar,
    getUserDetails,
    updateCoverimage,
    updatedetails,
    getUserChannelProfile,
    watchHistory
};
