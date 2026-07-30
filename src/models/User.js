import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  title: String,
  thumbnail: String,
  channelTitle: String,
}, { _id: false, timestamps: true });

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  videos: { type: [videoSchema], default: [] },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: "" },
  likedVideos: { type: [videoSchema], default: [] },
  watchLater: { type: [videoSchema], default: [] },
  watchHistory: { type: [videoSchema], default: [] },
  searchHistory: { type: [String], default: [] },
  playlists: { type: [playlistSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
