import express from "express";
import dotenv from "dotenv";
import songRoutes from './route.js'
import { createClient } from 'redis';
import cors from 'cors';

dotenv.config();

export const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
});

redisClient.connect().then(() =>
    console.log("Connected to Redis")
).catch(err => {
    console.error("Redis connection error:", err);
});

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors());

app.use("/api/v1", songRoutes)

app.get("/", (req, res) => {
    res.send("Song Service is running!");
});

app.listen(PORT, () => {
    console.log(`Song Service is running on port ${PORT}`);
});