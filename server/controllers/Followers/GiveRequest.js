import followerModel from "../../models/Followers.js";
import userModel from "../../models/User.js";
import { io } from "../../configs/socketio.js";
import notificationModel from "../../models/Notification.js"

async function giveFollowRequest(req, res) {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
        return res.status(400).json({
            message: "Both fromUserId and toUserId are required",
            error: true,
            success: false
        });
    }

    if (fromUserId === toUserId) {
        return res.status(400).json({
            message: "You cannot follow yourself",
            error: true,
            success: false
        });
    }

    try {
        let toUserFollowers = await followerModel.findOne({ userId: toUserId });

        if (!toUserFollowers) {
            toUserFollowers = await followerModel.create({ userId: toUserId });
        }

        if (
            toUserFollowers.requests.includes(fromUserId) ||
            toUserFollowers.followers.includes(fromUserId)
        ) {
            return res.status(409).json({
                message: "Follow request already sent or already following",
                success: false,
                error: true
            });
        }

        toUserFollowers.requests.push(fromUserId);
        await toUserFollowers.save();

        const fromUser = await userModel.findById(fromUserId).select("username");

        await notificationModel.create({
            userId: toUserId,
            type: "follow-request",
            fromUser: fromUserId,
            message: "You have a new follow request"
        });


        io.to(toUserId).emit("follow-request", {
            message: "You have a new follow request",
            from: fromUser?.username || "Unknown User",
            fromId: fromUserId
        });


        return res.status(200).json({
            message: "Message request sent",
            success: true
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export default giveFollowRequest;
