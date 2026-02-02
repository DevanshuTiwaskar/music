import { consumeEvents } from "./rabbit.js";
import { createUserLibrary } from "../services/musicLibraryService.js";

export default function startMusicSubscriber() {

  consumeEvents("music.queue", async (data, routingKey) => {

    // ✅ When user registers → create library
    if (routingKey === "user.registered") {
      console.log("🎧 New user registered:", data);

      await createUserLibrary(data.userId, data.username);

      console.log(`✅ Library created for ${data.username}`);
    }

    // ✅ When song uploaded (future use)
    if (routingKey === "music.song_uploaded") {
      console.log("🎵 Song uploaded event:", data);
    }

  });

}
