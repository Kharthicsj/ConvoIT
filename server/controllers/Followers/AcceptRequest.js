import followerModel from "../../models/Followers.js";
import { io } from "../../configs/socketio.js";
import notificationModel from "../../models/Notification.js";

async function AcceptRequest(req, res) {
    try {
        const { fromUserId, toUserId } = req.body;

        if (!fromUserId || !toUserId) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false,
            });
        }

        const toUserUpdate = await followerModel.findOneAndUpdate(
            { userId: toUserId },
            {
                $pull: { requests: fromUserId },
                $addToSet: { followers: fromUserId },
            },
            { new: true }
        );

        if (!toUserUpdate) {
            return res.status(404).json({
                message: "Receiver's follower document not found",
                success: false,
            });
        }

        await followerModel.findOneAndUpdate(
            { userId: fromUserId },
            {
                $addToSet: { followers: toUserId },
            },
            { new: true, upsert: true }
        );

        // Remove the notification from the DB
        await notificationModel.deleteOne({
            userId: toUserId,
            fromUser: fromUserId,
            type: "follow-request"
        });

        // Notify sender
        io.to(fromUserId).emit("follow-accepted", {
            message: "Your follow request was accepted",
            byUserId: toUserId,
        });

        // Notify both users to update followers list
        io.to(fromUserId).emit("follower-updated");
        io.to(toUserId).emit("follower-updated");

        return res.status(200).json({
            message: "Follow request accepted successfully",
            success: true,
            data: toUserUpdate,
        });
    } catch (err) {
        console.error("Error in AcceptRequest:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

export default AcceptRequest;
