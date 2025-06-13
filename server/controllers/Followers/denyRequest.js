import mongoose from "mongoose";
import followerModel from "../../models/Followers.js";
import notificationModel from "../../models/Notification.js";

async function denyRequest(req, res) {
    try {
        let { fromUserId, toUserId } = req.body;

        if (fromUserId && typeof fromUserId === "object" && fromUserId.$oid) {
            fromUserId = fromUserId.$oid;
        }
        if (toUserId && typeof toUserId === "object" && toUserId.$oid) {
            toUserId = toUserId.$oid;
        }

        const fromObjectId = mongoose.Types.ObjectId.createFromHexString(fromUserId);
        const toObjectId = mongoose.Types.ObjectId.createFromHexString(toUserId);

        const doc = await followerModel.findOne({ userId: toObjectId });

        if (!doc) {
            return res.status(404).json({ success: false, message: "Follower document not found" });
        }

        doc.requests = doc.requests.filter(
            (reqId) => !reqId.equals(fromObjectId)
        );

        await doc.save();

        // Remove the notification from the DB
        await notificationModel.deleteOne({
            userId: toUserId,
            fromUser: fromUserId,
            type: "follow-request"
        });

        res.status(200).json({ success: true, message: "Request denied and removed" });

    } catch (err) {
        console.error("Error in denyRequest:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export default denyRequest;
