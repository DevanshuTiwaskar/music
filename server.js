import app from './src/app.js'
import config from './src/config/config.js'
import connectDB from './src/db/db.js'
import { connectRabbit, consumeEvents } from './src/broker/rabbit.js'
import startMusicSubscriber from './src/broker/MusicSubscriber.js'

connectDB()

const PORT = config.PORT || 4002

  // Connect Rabbit first
  await connectRabbit("music.queue");

  // Start listening
  startMusicSubscriber();
app.listen(PORT,()=>{
    console.log(`🔥Music server is runnging on port: ${PORT}`)
})