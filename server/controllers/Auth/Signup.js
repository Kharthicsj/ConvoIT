import userModel from "../../models/User.js";
import bcrypt from "bcryptjs";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

async function Signup(req, res) {
    const { username, email, password, profilepic } = req.body;

    try {
        const isExistingUser = await userModel.findOne({ email });
        if (isExistingUser) {
            return res.status(409).json({
                message: "Email already registered. Please login.",
                error: true,
                success: false
            });
        }

        const isOccupiedUserName = await userModel.findOne({ username });
        if (isOccupiedUserName) {
            return res.status(409).json({
                message: "Username already exists. Please use another.",
                error: true,
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        let profilePicUrl = "";

        if (profilepic) {
            profilePicUrl = await uploadToCloudinary(profilepic);
        }

        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            profilepic: profilePicUrl
        });

        const result = await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            addedUser: result,
            error: false,
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

export default Signup;
