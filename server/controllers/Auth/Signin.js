import userModel from "../../models/User.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

async function Signin(req, res) {
    const { email, password } = req.body
    try {
        const isExistingUser = await userModel.findOne({ email: email })

        if (!isExistingUser) {
            return res.status(401).json({
                message: "User Account Not Found",
                error: true,
                success: false
            })
        }

        const validatePassword = await bcrypt.compare(password, isExistingUser.password);
        if (!validatePassword) {
            return res.status(404).json({
                message: "Invalid Password",
                error: true,
                success: false
            })
        }

        const token = jwt.sign(
            { userId: isExistingUser._id, email: isExistingUser.email },
            "mysecretcode",
            { expiresIn: "1d" }
        );
        
        return res.status(201).json({
            message: "Login Successful",
            token: token,
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

export default Signin