import { Apierror } from "../utils/apierror.js";
import { Playlist } from "../models/playlists.models.js";
import mongoose from "mongoose";

const createPlaylist = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title && !description) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            })
        }

        const createdPlaylist = await Playlist.create({
            name: title,
            description: description,
            owner: req.user?.id
        })

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: createdPlaylist
        })
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        })
    }
}

const addVideoToPlaylist = async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { video: videoId } },
            { new: true }
        );

        if (!updatedPlaylist) {
            throw new Apierror(404, "Playlist not found");
        }

        return res.status(200).json({
            success: true,
            message: "Video added to playlist successfully",
            data: updatedPlaylist
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.user?.id;

        const playlists = await Playlist.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videos",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                title: 1,
                                description: 1,
                                videoFile: 1,
                                thumbnail: 1,
                                views: 1,
                                duration: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    videos: "$videos"
                }
            }
        ])

        return res.status(200).json({
            success: true,
            message: "User playlists retrieved successfully",
            data: playlists[0]
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
}

const getPlaylistById = async (req, res) => {
    try {
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId)
            .populate("video", "-isPublished -views -createdAt -updatedAt -__v")
            .select("-owner -createdAt -updatedAt -__v")
            .sort({ createdAt: -1 });

        if (!playlist) {
            throw new Apierror(404, "Playlist not found");
        }

        return res.status(200).json({
            success: true,
            message: "Playlist retrieved successfully",
            data: playlist
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const removeVideoFromPlaylist = async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $pull: { video: videoId }
            }, 
            { new: true }
        );

        if (!playlist) {
            throw new Apierror(404, "Playlist not found");
        }

        return res.status(200).json({
            success: true,
            message: "Video removed from playlist successfully",
            data: playlist
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;

        const playlist = await Playlist.findByIdAndDelete(playlistId);

        if (!playlist) {
            throw new Apierror(404, "Playlist not found");
        }

        return res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            data: playlist
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

const updatePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { name, description } = req.body;

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { name: name, description: description },
            { new: true, runvalidators: true }
        );

        if (!updatedPlaylist) {
            throw new Apierror(404, "Playlist not found");
        }

        return res.status(200).json({
            success: true,
            message: "Playlist updated successfully",
            data: updatedPlaylist
        });
    } catch (error) {
        return res.status(error?.statuscode || 500).json({
            success: false,
            message: error?.message || "Internal server error"
        });
    }
};

export {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylists,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};