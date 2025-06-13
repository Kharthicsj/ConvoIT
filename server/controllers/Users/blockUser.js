import followerModel from "../../models/Followers.js";
import { io } from "../../configs/socketio.js";

const blockUser = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { id: blockUserId } = req.params;

        if (!userId || !blockUserId) {
            return res.status(400).json({ success: false, message: "Missing userId or blockUserId" });
        }
        if (userId === blockUserId) {
            return res.status(400).json({ success: false, message: "You cannot block yourself" });
        }

        // Remove blockUserId from user's followers and requests, and add to blocked
        await followerModel.findOneAndUpdate(
            { userId },
            {
                $pull: { followers: blockUserId, requests: blockUserId },
                $addToSet: { blocked: blockUserId }
            },
            { new: true, upsert: true }
        );

        // Remove userId from blockUserId's followers and requests, and add to blocked
        await followerModel.findOneAndUpdate(
            { userId: blockUserId },
            {
                $pull: { followers: userId, requests: userId },
                $addToSet: { blocked: userId }
            },
            { new: true, upsert: true }
        );

        // Send real-time notification to both users
        io.to(userId).emit("block-update", {
            blockedUserId: blockUserId,
            message: "You have blocked this user. Chatting is now disabled."
        });
        io.to(blockUserId).emit("block-update", {
            blockedUserId: userId,
            message: "You have been blocked by this user. Chatting is now disabled."
        });

        return res.json({ success: true, message: "User blocked successfully" });
    } catch (err) {
        console.error("Block User Error:", err);
        return res.status(500).json({ success: false, message: "Failed to block user" });
    }
};

export default blockUser;