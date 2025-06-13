import userModel from "../../models/User.js";

async function fetchLoggedInUserData(req, res) {
    const { userId, email } = req.userData;
    try {
        const userData = await userModel.findOne({ _id: userId, email: email });
        return res.status(201).json({
            message: "Successfully fetched userData",
            user: userData,
            error: false,
            success: true
        })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export default fetchLoggedInUserData