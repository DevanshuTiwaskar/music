import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Playlist name is required"],
  },
  description: {
    type: String,
    default: "",
  },
  createdBy: {
    type: String, // ✅ store user ID as string instead of ref
    required: true,
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const playlistModel = mongoose.model("Playlist", playlistSchema);

export default playlistModel;
