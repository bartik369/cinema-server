import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import actorRoutes from './routes/actorRoutes.js'
import movieRoutes from './routes/movieRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import * as severConst from './utils/constants.js'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
dotenv.config();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:3000',
    })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', actorRoutes, movieRoutes, userRoutes, profileRoutes, adminRoutes);
app.use('/uploads', express.static(__dirname + '/uploads'));

server.listen(PORT, () => {
    console.log(`${severConst.serverStart} ${PORT}`);
});

const start = async() => {
    try {
        await mongoose.connect(process.env.DB_URL);
    } catch (error) {
        console.log(error);
    }
};
start();