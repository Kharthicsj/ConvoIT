import followerModel from "../../models/Followers.js";
import userModel from "../../models/User.js";

async function getRequestUsers(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId", success: false });
        }
        const followerData = await followerModel.findOne({ userId }).populate("requests", "username profilepic");
        if (!followerData) {
            return res.status(404).json({ message: "Requests data not found", success: false });
        }
        return res.status(200).json({
            message: "Requests fetched successfully",
            success: true,
            requests: followerData.requests,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

export default getRequestUsers;