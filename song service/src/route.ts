import express from "express"
import { getAllAlbum, getAllSongs, getAllSongsOfAlbum, getSingleSong } from "./controller";

const router = express.Router()

router.get("/album/all", getAllAlbum);
router.get("/song/all", getAllSongs); 
router.get("/album/:id", getAllSongsOfAlbum)
router.get("/song/:id", getSingleSong);

export default router;