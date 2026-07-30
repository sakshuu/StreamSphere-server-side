import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { publicUser } from "../utils/userResponse.js";

const router = Router();
router.use(requireAuth);
const allowedLists = new Set(["likedVideos", "watchLater"]);
const cleanVideo = (video) => ({
  videoId: video.videoId,
  title: video.title,
  thumbnail: video.thumbnail,
  channelTitle: video.channelTitle,
});

router.post("/:list/toggle", async (req, res, next) => {
  try {
    const { list } = req.params;
    if (!allowedLists.has(list) || !req.body.video?.videoId)
      return res.status(400).json({ message: "Invalid saved-video request." });
    const user = await User.findById(req.userId);
    const index = user[list].findIndex(
      (item) => item.videoId === req.body.video.videoId,
    );
    if (index >= 0) user[list].splice(index, 1);
    else user[list].unshift(cleanVideo(req.body.video));
    await user.save();
    res.json({ saved: index < 0, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
router.post("/history/watch", async (req, res, next) => {
  try {
    if (!req.body.video?.videoId)
      return res.status(400).json({ message: "Video is required." });
    const user = await User.findById(req.userId);
    user.watchHistory = user.watchHistory.filter(
      (item) => item.videoId !== req.body.video.videoId,
    );
    user.watchHistory.unshift(cleanVideo(req.body.video));
    user.watchHistory = user.watchHistory.slice(0, 50);
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
router.post("/history/search", async (req, res, next) => {
  try {
    const query = String(req.body.query || "").trim();
    if (!query)
      return res.status(400).json({ message: "Search query is required." });
    const user = await User.findById(req.userId);
    user.searchHistory = [
      query,
      ...user.searchHistory.filter(
        (item) => item.toLowerCase() !== query.toLowerCase(),
      ),
    ].slice(0, 15);
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
router.post("/playlists", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    user.playlists.push({ name: req.body.name });
    await user.save();
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
router.post("/playlists/:playlistId/videos", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const playlist = user.playlists.id(req.params.playlistId);
    if (!playlist || !req.body.video?.videoId)
      return res.status(404).json({ message: "Playlist or video not found." });
    if (
      !playlist.videos.some((item) => item.videoId === req.body.video.videoId)
    )
      playlist.videos.unshift(cleanVideo(req.body.video));
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
export default router;
