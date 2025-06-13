import messageModel from "../../models/Message.js";

const fetchMessage = async (req, res) => {
    try {
        const userId = req.userData.userId; // from tokenAuth middleware
        const { id: otherUserId } = req.params;

        if (!userId || !otherUserId) {
            return res.status(400).json({ success: false, message: "Missing userId or otherUserId" });
        }

        const messages = await messageModel.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 }); // oldest first

        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

export default fetchMessage;