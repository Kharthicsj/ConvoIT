import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const deleteFromCloudinary = async (publicIds) => {
    try {
        if (!publicIds || (Array.isArray(publicIds) && publicIds.length === 0)) {
            throw new Error("No public_id(s) provided for deletion.");
        }

        const ids = Array.isArray(publicIds) ? publicIds : [publicIds];

        const result = await cloudinary.api.delete_resources(ids);
        return result;
    } catch (err) {
        console.error("Cloudinary Deletion Error:", err);
        throw err;
    }
};

export default deleteFromCloudinary;
