import userModel from "../../models/User.js";

async function chatUserInfo(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "User ID is required",
                error: true,
                success: false
            });
        }

        const user = await userModel.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export default chatUserInfo