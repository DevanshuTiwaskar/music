import express from "express";
import multer from "multer";
import { authArtistMiddleware } from "../middlewares/auth.middleware.js";
import * as musicController from "../controller/musicController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🎵 Upload new music
router.post(
  "/create",
  authArtistMiddleware,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  musicController.createMusic
);

// 🎧 Get all music or by artistId (optional ?artistId=)
router.get("/get", musicController.getMusic);

// 📀 Create a new playlist
router.post("/playlist/create", authArtistMiddleware, musicController.createPlaylist);


// 🎶 Get all playlists or a single one (?playlistId=)
router.get("/playlist/get", musicController.getPlaylists);


export default router;
