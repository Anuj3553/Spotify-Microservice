import { Request, Response } from "express";
import { sql } from "./config/db.js";
import TryCatch from "./TryCatch.js";
import getBuffer from "./config/dataUri.js";
import cloudinary from "cloudinary";
import { redisClient } from "./index.js";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    } | null;
}

export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const { title, description } = req.body;

    const file = req.file;

    if (!file) {
        res.status(400).json({
            message: "File is required"
        });
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Invalid file format"
        });
        return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "spotify/albums",
    })

    const result = await sql`
    INSERT INTO albums (title, description, thumbnail)
    VALUES (${title}, ${description}, ${cloud.secure_url})
    RETURNING *;
    `;

    if(redisClient.isReady) {
        await redisClient.del("albums");
        console.log("Cache invalidated for albums");
    }

    res.status(201).json({
        message: "Album added successfully",
        album: result[0]
    });
});

export const addSong = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const { title, description, album } = req.body;

    const isAlbum = await sql`
    SELECT * FROM albums WHERE id = ${album};
    `;

    if (isAlbum.length === 0) {
        res.status(404).json({
            message: "Album not found"
        });
        return;
    }

    const file = req.file;

    if (!file) {
        res.status(400).json({
            message: "File is required"
        });
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Invalid file format"
        });
        return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "spotify/songs",
        resource_type: 'video' // Use 'video' for audio files
    })

    const result = await sql`
    INSERT INTO songs (title, description, audio, album_id)
    VALUES (${title}, ${description}, ${cloud.secure_url}, ${album})
    RETURNING *;
    `;

    if(redisClient.isReady) {
        await redisClient.del("songs");
        console.log("Cache invalidated for songs");
    }

    res.status(201).json({
        message: "Song added successfully",
        song: result[0]
    });
});
 
export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const song = await sql`
    SELECT * FROM songs WHERE id = ${req.params.id};
    `;
    if (song.length === 0) {
        res.status(404).json({
            message: "Song not found"
        });
        return;
    }

    const file = req.file;

    if (!file) {
        res.status(400).json({
            message: "File is required"
        });
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Invalid file format"
        });
        return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "spotify/thumbnails",
    });

    const result = await sql`
        UPDATE songs
        SET thumbnail = ${cloud.secure_url}
        WHERE id = ${req.params.id}
        RETURNING *;
    `;

    if(redisClient.isReady) {
        await redisClient.del("songs");
        console.log("Cache invalidated for songs");
    }

    res.status(200).json({
        message: "Thumbnail added successfully",
        song: result[0]
    });
});

export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const { id } = req.params;

    const isAlbum = await sql`
    SELECT * FROM albums WHERE id = ${id};
    `;

    if (isAlbum.length === 0) {
        res.status(404).json({
            message: "Album not found"
        });
        return;
    }

    await sql`
        DELETE FROM songs
        WHERE album_id = ${id}
    `;

    await sql`
        DELETE FROM albums
        WHERE id = ${id}
    `;

    if(redisClient.isReady) {
        await redisClient.del("albums");
        console.log("Cache invalidated for albums");
    }

    if(redisClient.isReady) {
        await redisClient.del("songs");
        console.log("Cache invalidated for songs");
    }

    res.status(200).json({
        message: "Album deleted successfully",
    });
});

export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const { id } = req.params;

    const isSong = await sql`
    SELECT * FROM songs WHERE id = ${id};
    `;

    if (isSong.length === 0) {
        res.status(404).json({
            message: "Song not found"
        });
        return;
    }

    await sql`
        DELETE FROM songs
        WHERE id = ${id}
    `;

    if(redisClient.isReady) {
        await redisClient.del("songs");
        console.log("Cache invalidated for songs");
    }

    res.status(200).json({
        message: "Song deleted successfully",
    });
});