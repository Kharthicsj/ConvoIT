import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* 
Simplified code Version

const uploadToCloudinary = async (base64Image) => {
  try {
	const result = await cloudinary.uploader.upload(base64Image, {
	  folder: "ecommerce-products",
	});
	return result.secure_url;
  } catch (err) {
	console.error("Upload error:", err);
	throw err;
  }
};

 */

const uploadToCloudinary = async (base64Image) => {
	try {
		const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
		const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

		const cleanedBase64 = base64Image.replace(/^data:.+;base64,/, "");

		const formattedData = `data:${mimeType};base64,${cleanedBase64}`;

		const result = await cloudinary.uploader.upload(formattedData, {
			folder: "convoIt/users",
		});

		return result.secure_url;
	} catch (err) {
		console.error("Upload error:", err);
		throw err;
	}
};

export default uploadToCloudinary;
