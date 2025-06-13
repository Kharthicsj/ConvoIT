import followerModel from "../../models/Followers.js";
import userModel from "../../models/User.js";

async function getFollowers(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: "Missing userId",
                success: false,
            });
        }

        const followerData = await followerModel.findOne({ userId }).populate("followers", "username profilepic");

        if (!followerData) {
            return res.status(404).json({
                message: "Followers data not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Followers fetched successfully",
            success: true,
            followers: followerData.followers,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false,
        });
    }
}

export default getFollowers;
