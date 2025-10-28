import express from 'express'
import multer from 'multer'
import {authArtistMiddleware} from "../middlewares/auth.middleware.js"
import * as musicController from "../controller/musicController.js"


const router = express.Router()
const upload = multer({ storage: multer.memoryStorage()})



router.post('/create', authArtistMiddleware,
      upload.fields([
        { name: "music", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), musicController.createMusic)



export default router