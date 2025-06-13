import messageModel from "../../models/Message.js";
import deleteFromCloudinary from "../../utils/deleteFromCloudinary.js";

const extractPublicId = (url) => {
    if (!url) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
    return match ? match[1] : null;
};

const clearChat = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { id: otherUserId } = req.params;

        if (!userId || !otherUserId) {
            return res.status(400).json({ success: false, message: "Missing userId or otherUserId" });
        }

        // Find all messages between the two users
        const messages = await messageModel.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        });

        // Collect all Cloudinary public_ids to delete
        const publicIds = [];
        messages.forEach(msg => {
            if (msg.image) {
                const pid = extractPublicId(msg.image);
                if (pid) publicIds.push(pid);
            }
            if (msg.file && msg.file.url) {
                const pid = extractPublicId(msg.file.url);
                if (pid) publicIds.push(pid);
            }
        });

        // Delete files from Cloudinary
        if (publicIds.length > 0) {
            await deleteFromCloudinary(publicIds);
        }

        // Delete messages from DB
        await messageModel.deleteMany({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        });

        res.json({ success: true, message: "Chat cleared" });
    } catch (err) {
        console.error("Clear Chat Error:", err);
        res.status(500).json({ success: false, message: "Failed to clear chat" });
    }
};

export default clearChat;