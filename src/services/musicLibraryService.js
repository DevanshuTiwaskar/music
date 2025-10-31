// services/musicLibraryService.js
export const createUserLibrary = async (userId, username) => {
  // Here you can create a record in MongoDB
  console.log(`Creating music library for ${username} (${userId})`);
  // Example: await MusicLibrary.create({ userId, username, songs: [] });
};
