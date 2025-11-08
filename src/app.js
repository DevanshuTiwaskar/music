import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import musicRoutes from './router/music.routes.js'
import cors from "cors"

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",  // your React app URL
  credentials: true,                // if using cookies or auth headers
}));

app.use('/api/music', musicRoutes);




export default app;