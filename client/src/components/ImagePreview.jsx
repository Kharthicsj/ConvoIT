import React, { useEffect } from "react";
import OrigamiPic from "../assets/origami.png"; // adjust path if needed

function ImagePreview({ imageUrl, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const fallbackImage = imageUrl || OrigamiPic;

    return (
        <div
            className="fixed inset-0 bg-transparent bg-opacity-70 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="relative max-w-[50vw] max-h-[50vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-semibold text-black shadow hover:bg-gray-200"
                >
                    ✕
                </button>
                <img
                    src={fallbackImage}
                    alt="Preview"
                    className="max-w-full max-h-full rounded shadow-lg"
                />
            </div>
        </div>
    );
}

export default ImagePreview;
