import {Router} from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { 
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylists,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";


const router = Router();


router.route("/create-playlist/:videoId").post(authMiddleware,createPlaylist);
router.route("/add-video-to-playlist/:playlistId/:videoId").post(authMiddleware,addVideoToPlaylist);
router.route("/get-user-playlists").get(authMiddleware,getUserPlaylists);
router.route("/get-playlist/:playlistId").get(authMiddleware,getPlaylistById);
router.route("/remove-video-from-playlist/:playlistId/:videoId").delete(authMiddleware,removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(authMiddleware,deletePlaylist);
router.route("/update-playlist/:playlistId").put(authMiddleware,updatePlaylist);

export default router;