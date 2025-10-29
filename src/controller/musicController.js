import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import { uploadFile, getSignedUrlForAccess } from "../services/storage.service.js";


// ✅ Create Music
export async function createMusic(req, res) {
  try {
    const musicFile = req.files["music"][0];
    const coverImageFile = req.files["coverImage"][0];

    const music = await uploadFile(musicFile);
    const coverImage = await uploadFile(coverImageFile);

    const musicDoc = await musicModel.create({
      title: req.body.title,
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      musicUrl: music,
      coverImageUrl: coverImage,
      genre: req.body.genre || "Unknown",
      duration: req.body.duration || 0,
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


// ✅ Get Music (All or by Artist)
export async function getMusic(req, res) {
  try {
    const filter = req.query.artistId ? { artistId: req.query.artistId } : {};
    const musics = await musicModel.find(filter).sort({ createdAt: -1 });

    const signedMusics = await Promise.all(
      musics.map(async (music) => ({
        id: music._id,
        title: music.title,
        artist: music.artist,
        musicUrl: await getSignedUrlForAccess(music.musicUrl),
        coverImageUrl: await getSignedUrlForAccess(music.coverImageUrl),
        genre: music.genre,
        createdAt: music.createdAt,
      }))
    );

    res.status(200).json({ message: "Music fetched successfully", musics: signedMusics });
  } catch (err) {
    console.error("Error fetching music:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}


// ✅ Create Playlist
export async function createPlaylist(req, res) {
  try {
    const { name, description, songs } = req.body; // songs = array of song IDs

    const playlist = await playlistModel.create({
      name,
      description,
      createdBy: req.user.id,
      songs,
    });

    // Add playlistId to each song
    await musicModel.updateMany(
      { _id: { $in: songs } },
      { $addToSet: { playlistIds: playlist._id } }
    );

    res.status(201).json({ message: "Playlist created successfully", playlist });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}



// ✅ Get Playlists (All or By ID)
export async function getPlaylists(req, res) {
  try {
    const { playlistId } = req.query;

    // If playlistId provided → return single playlist
    let playlists;
    if (playlistId) {
      playlists = await playlistModel
        .findById(playlistId)
        .populate("songs")
        .populate("createdBy", "fullName email");
    } else {
      // Otherwise return all playlists
      playlists = await playlistModel
        .find()
        .populate("songs")
        .populate("createdBy", "fullName email");
    }

    if (!playlists) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Ensure playlists is always an array (for consistent response)
    const playlistArray = Array.isArray(playlists) ? playlists : [playlists];

    // Convert songs to include signed URLs
    const signedPlaylists = await Promise.all(
      playlistArray.map(async (playlist) => {
        const signedSongs = await Promise.all(
          playlist.songs.map(async (song) => ({
            id: song._id,
            title: song.title,
            artist: song.artist,
            genre: song.genre,
            musicUrl: await getSignedUrlForAccess(song.musicUrl),
            coverImageUrl: await getSignedUrlForAccess(song.coverImageUrl),
            createdAt: song.createdAt,
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
