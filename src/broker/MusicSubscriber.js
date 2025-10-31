// MusicSubscriber.js
import { subscribrQueue } from "./rabbit.js";
import { createUserLibrary } from "../services/musicLibraryService.js";

export default () => {
  // Listen to new user registration event
  subscribrQueue("AUTHENTICATION_NOTIFICATION_USER.REGISTERED", async (message) => {
    console.log("🎧 New user registered:", message);

    // Create an empty music library for the new user
    await createUserLibrary(message.userId, message.username);

    console.log(`Music library created for user: ${message.username}`);
  });

  // (Optional) You can listen for other events like “SONG.UPLOADED”
  subscribrQueue("MUSIC_SERVICE_SONG.UPLOADED", async (message) => {
    console.log("🎵 New song uploaded:", message);
    // handle metadata, indexing, or notify other services if needed
  });
};
