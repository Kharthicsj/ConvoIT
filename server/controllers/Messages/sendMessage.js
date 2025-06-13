import messageModel from "../../models/Message.js";
import { io } from "../../configs/socketio.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

async function sendMessage(req, res) {
    try {
        const { senderId, receiverId, text, image, file } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ success: false, message: "senderId and receiverId are required" });
        }

        let fileData = null;
        if (file && file.base64 && file.name && file.type) {
            const uploadedUrl = await uploadToCloudinary(file.base64);
            fileData = {
                url: uploadedUrl,
                name: file.name,
                type: file.type
            };
        }

        let imageUrl = null;
        if (image) {
            imageUrl = await uploadToCloudinary(image);
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            file: fileData
        });

        io.to(receiverId).emit("new-message", {
            ...newMessage._doc
        });

        return res.status(201).json({ success: true, message: newMessage });
    } catch (err) {
        console.error("Send Message Error:", err);
        return res.status(500).json({ success: false, message: "Failed to send message" });
    }
}

export default sendMessage;