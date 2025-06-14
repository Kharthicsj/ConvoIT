import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilepic: {
        type: String,
        default: ""
    },
}, {
    timestamps: true,
})

const userModel = new mongoose.model("User", userSchema);
export default userModel