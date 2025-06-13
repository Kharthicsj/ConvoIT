import userModel from "../../models/User.js"
import mongoose from "mongoose"

async function searchUser(req, res) {
    const { searchData } = req.body;

    if (!searchData) {
        return res.status(400).json({
            message: "Search query is required",
            error: true,
            success: false
        });
    }

    try {
        const query = [];

        if (mongoose.Types.ObjectId.isValid(searchData)) {
            query.push({ _id: searchData });
        }

        query.push(
            { username: { $regex: `^${searchData}`, $options: 'i' } },
            { email: { $regex: `^${searchData}`, $options: 'i' } }

        );

        const users = await userModel.find({ $or: query }).select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            success: true,
            data: users
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export default searchUser;
