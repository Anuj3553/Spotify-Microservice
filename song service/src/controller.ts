import { sql } from "./config/db";
import TryCatch from "./TryCatch";
import { redisClient } from "./index.js";

export const getAllAlbum = TryCatch(async (req, res) => {
    let albums;
    const CACHE_EXPIRE_TIME = process.env.CACHE_EXPIRE_TIME || 1800; // Default to 30 minutes if not set

    if (redisClient.isReady) {
        albums = await redisClient.get("albums");

        if (albums) {
            console.log("Cache hit for albums");
            res.status(200).json(JSON.parse(albums));
            return;
        } else {
            console.log("Cache miss for albums, fetching from database");

            albums = await sql`
            SELECT * FROM albums
            `;

            if (redisClient.isReady) {
                await redisClient.set("albums", JSON.stringify(albums), {
                    EX: CACHE_EXPIRE_TIME as number
                });
                console.log("Albums cached successfully");
            }

            res.status(200).json(albums);
        }
    }
});

export const getAllSongs = TryCatch(async (req, res) => {
    let songs;

    const CACHE_EXPIRE_TIME = process.env.CACHE_EXPIRE_TIME || 1800; // Default to 30 minutes if not set

    if (redisClient.isReady) {
        songs = await redisClient.get("songs");

        if (songs) {
            console.log("Cache hit for songs");
            res.status(200).json(JSON.parse(songs));
            return;
        } else {
            console.log("Cache miss for songs, fetching from database");

            songs = await sql`
                SELECT * FROM songs
            `;

            if (redisClient.isReady) {
                await redisClient.set("songs", JSON.stringify(songs), {
                    EX: CACHE_EXPIRE_TIME as number
                });
                console.log("Songs cached successfully");
            }

            res.status(200).json(songs);
            return;
        }
    }
});

export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
    const { id } = req.params;
    const CACHE_EXPIRE_TIME = process.env.CACHE_EXPIRE_TIME || 1800; // Default to 30 minutes if not set
    const cacheKey = `album:${id}:songs`;

    // Try to get from cache first
    if (redisClient.isReady) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for album ${id} songs`);
            res.status(200).json(JSON.parse(cachedData));
            return;
        }
    }

    // If not in cache, fetch from database
    console.log(`Cache miss for album ${id} songs, fetching from database`);

    const album = await sql`
        SELECT * FROM albums WHERE id = ${id}
    `;

    if (album.length === 0) {
        res.status(404).json({ message: "Album not found" });
        return;
    }

    const songs = await sql`
        SELECT * FROM songs WHERE album_id = ${id}
    `;

    const responseData = {
        album: album[0],
        songs
    };

    // Cache the result
    if (redisClient.isReady) {
        await redisClient.set(cacheKey, JSON.stringify(responseData), {
            EX: CACHE_EXPIRE_TIME as number
        });
        console.log(`Cached songs for album ${id}`);
    }

    res.status(200).json(responseData);
});

export const getSingleSong = TryCatch(async (req, res) => {
    const { id } = req.params;

    let song;

    song = await sql`
        SELECT * FROM songs WHERE id = ${id}
    `;

    if (song.length === 0) {
        res.status(404).json({ message: "Song not found" });
        return;
    }

    res.status(200).json(song[0]);
});