// Create a new file SongCard.tsx
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { MdDelete } from "react-icons/md";

interface SongCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    song: any;
    btnLoading: boolean;
    onFileChange: (file: File | null) => void;
    onAddThumbnail: (id: string) => void;
    onDeleteSong: (id: string) => void;
}

const SongCard = ({
    song,
    btnLoading,
    onFileChange,
    onAddThumbnail,
    onDeleteSong
}: SongCardProps) => {
    const [isAddingThumbnail, setIsAddingThumbnail] = useState(false);
    const songFileInputRef = useRef<HTMLInputElement>(null);

    const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const selectedFile = e.target.files?.[0] || null;
        onFileChange(selectedFile);
        setIsAddingThumbnail(true);
    };

    useEffect(() => {
        if (isAddingThumbnail) {
            onAddThumbnail(song.id);
            setIsAddingThumbnail(false);
        }
    }, [isAddingThumbnail, song.id, onAddThumbnail]);

    return (
        <div className="bg-[#181818] p-4 rounded-lg shadow-md">
            {song.thumbnail ? (
                <img src={song.thumbnail} className="mr-1 w-52 h-52" alt="" />
            ) : (
                <div className="flex flex-col justify-center items-center gap-2 w-[250px]">
                    <input
                        ref={songFileInputRef}
                        type="file"
                        onChange={fileChangeHandler}
                        style={{ display: "none" }}
                        accept="image/*"
                    />

                    <button
                        type="button"
                        onClick={() => songFileInputRef.current?.click()}
                        className="auth-btn"
                        style={{ width: "200px" }}
                        disabled={btnLoading}
                    >
                        {btnLoading ? "Please Wait..." : "Add Thumbnail"}
                    </button>
                </div>
            )}

            <h4 className="text-lg font-bold">{song.title.slice(0, 30)}</h4>
            <h4 className="text-lg font-bold">
                {song.description.slice(0, 20)}..
            </h4>
            <button
                disabled={btnLoading}
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => onDeleteSong(song.id)}
            >
                <MdDelete />
            </button>
        </div>
    );
};

export default SongCard;