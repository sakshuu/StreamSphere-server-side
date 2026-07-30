export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  likedVideos: user.likedVideos,
  watchLater: user.watchLater,
  watchHistory: user.watchHistory,
  searchHistory: user.searchHistory,
  playlists: user.playlists,
});
