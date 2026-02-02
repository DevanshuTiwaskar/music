import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import { uploadFile, getSignedUrlForAccess } from "../services/storage.service.js";
import { publishEvent } from "../broker/rabbit.js";


// =====================================================
// ✅ Create Music
// =====================================================
export async function createMusic(req, res) {
  try {
    if (!req.files?.music || !req.files?.coverImage) {
      return res
        .status(400)
        .json({ message: "Music file and cover image are required" });
    }

    const musicFile = req.files.music[0];
    const coverImageFile = req.files.coverImage[0];

    const musicUrl = await uploadFile(musicFile);
    const coverImageUrl = await uploadFile(coverImageFile);

    const musicDoc = await musicModel.create({
      title: req.body.title,
      artist:
        req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      musicUrl,
      coverImageUrl,
      genre: req.body.genre || "Unknown",
      duration: req.body.duration || 0,
    });

    // 🔥 Publish event to RabbitMQ
    publishEvent("music.song_uploaded", {
      musicId: musicDoc._id.toString(),
      title: musicDoc.title,
      artist: musicDoc.artist,
    });

    res.status(201).json({
      message: "Music created successfully",
      music: {
        id: musicDoc._id,
        title: musicDoc.title,
        artist: musicDoc.artist,
        musicUrl: await getSignedUrlForAccess(musicDoc.musicUrl),
        coverImageUrl: await getSignedUrlForAccess(musicDoc.coverImageUrl),
      },
    });
  } catch (err) {
    console.error("Error uploading music:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}


// =====================================================
// ✅ Get Music (All or by Artist)
// =====================================================
export async function getMusic(req, res) {
  try {
    const filter = req.query.artistId
      ? { artistId: req.query.artistId }
      : {};

    const musics = await musicModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const signedMusics = await Promise.all(
      musics.map(async (music) => ({
        id: music._id,
        title: music.title,
        artist: music.artist,
        genre: music.genre,
        createdAt: music.createdAt,
        musicUrl: await getSignedUrlForAccess(music.musicUrl),
        coverImageUrl: await getSignedUrlForAccess(music.coverImageUrl),
      }))
    );

    res.status(200).json({
      message: "Music fetched successfully",
      musics: signedMusics,
    });
  } catch (err) {
    console.error("Error fetching music:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}


// =====================================================
// ✅ Create Playlist
// =====================================================
export async function createPlaylist(req, res) {
  try {
    const { name, description, songs } = req.body;

    if (!songs || songs.length === 0) {
      return res.status(400).json({ message: "Songs are required" });
    }

    // Validate songs exist
    const existingSongs = await musicModel.find({
      _id: { $in: songs },
    });

    if (existingSongs.length !== songs.length) {
      return res.status(400).json({ message: "Some songs not found" });
    }

    const playlist = await playlistModel.create({
      name,
      description,
      createdBy: req.user.id,
      songs,
    });

    await musicModel.updateMany(
      { _id: { $in: songs } },
      { $addToSet: { playlistIds: playlist._id } }
    );

    res.status(201).json({
      message: "Playlist created successfully",
      playlist,
    });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}


// =====================================================
// ✅ Get Playlists (All or By ID)
// =====================================================
export async function getPlaylists(req, res) {
  try {
    const { playlistId } = req.query;

    let playlists;

    if (playlistId) {
      playlists = await playlistModel
        .findById(playlistId)
        .populate("songs")
        .populate("createdBy", "fullName email")
        .lean();
    } else {
      playlists = await playlistModel
        .find()
        .populate("songs")
        .populate("createdBy", "fullName email")
        .lean();
    }

    if (!playlists) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const playlistArray = Array.isArray(playlists)
      ? playlists
      : [playlists];

    const signedPlaylists = await Promise.all(
      playlistArray.map(async (playlist) => {
        const signedSongs = await Promise.all(
          playlist.songs.map(async (song) => ({
            id: song._id,
            title: song.title,
            artist: song.artist,
            genre: song.genre,
            createdAt: song.createdAt,
            musicUrl: await getSignedUrlForAccess(song.musicUrl),
            coverImageUrl: await getSignedUrlForAccess(song.coverImageUrl),
          }))
        );

        return {
          id: playlist._id,
          name: playlist.name,
          description: playlist.description,
          createdBy: playlist.createdBy,
          songs: signedSongs,
          createdAt: playlist.createdAt,
        };
      })
    );

    res.status(200).json({
      message: "Playlists fetched successfully",
      playlists: signedPlaylists,
    });
  } catch (err) {
    console.error("Error fetching playlists:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
