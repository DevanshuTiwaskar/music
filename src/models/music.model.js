import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  artist: {
    type: String,
    required: [true, "Artist is required"],
  },
  artistId: {
    type: String, // keep as string — don't use ref
    required: true,
  },
  musicUrl: {
    type: String,
    required: true,
  },
  coverImageUrl: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    default: "Unknown",
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  playlistIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const musicModel = mongoose.model("Music", musicSchema);
export default musicModel;
