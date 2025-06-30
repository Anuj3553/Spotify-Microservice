import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';
import AdminRoutes from './route.js';
import cloudinary from 'cloudinary';
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

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS albums (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS songs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255),
                audio VARCHAR(255) NOT NULL,
                album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

const PORT = process.env.PORT || 7000;

app.use("/api/v1/admin", AdminRoutes);

app.use(express.json());

app.use(cors());

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Admin service is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});
