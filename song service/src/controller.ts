import { sql } from "./config/db";
import TryCatch from "./TryCatch";

export const getAllAlbum = TryCatch(async (req, res) => {
    let albums;

    albums = await sql`
        SELECT * FROM albums
    `;

    res.status(200).json(albums);
});

export const getAllSongs = TryCatch(async (req, res) => {
    let songs;

    songs = await sql`
        SELECT * FROM songs
    `;

    res.status(200).json(songs);
});

export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
    const {id} = req.params;

    let album, songs;

    album = await sql`
        SELECT * FROM albums WHERE id = ${id}
    `;

    if (album.length === 0) {
        res.status(404).json({message: "Album not found"});
        return;
    }

    songs = await sql`
        SELECT * FROM songs WHERE album_id = ${id}
    `;

    res.status(200).json({
        album: album[0],
        songs
    });
});

export const getSingleSong = TryCatch(async (req, res) => {
    const {id} = req.params;

    let song;

    song = await sql`
        SELECT * FROM songs WHERE id = ${id}
    `;

    if (song.length === 0) {
        res.status(404).json({message: "Song not found"});
        return;
    }

    res.status(200).json(song[0]);
});