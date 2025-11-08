import express from "express";
import multer from "multer";
// ⭐ 1. Import the new middleware
import { authArtistMiddleware, authMiddleware } from "../middlewares/auth.middleware.js";
import * as musicController from "../controller/musicController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🎵 Upload new music (Artist Only - CORRECT)
router.post(
  "/create",
  authArtistMiddleware, // This is correct, only artists can upload
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  musicController.createMusic
);

// 🎧 Get all music (Public - CORRECT)
router.get("/get", musicController.getMusic);

// 📀 Create a new playlist (Any Logged-in User - FIXED)
// ⭐ 2. Use the new 'authMiddleware' here instead of 'authArtistMiddleware'
router.post("/playlist/create", authMiddleware, musicController.createPlaylist);


// 🎶 Get all playlists (Public - CORRECT)
router.get("/playlist/get", musicController.getPlaylists);


export default router;