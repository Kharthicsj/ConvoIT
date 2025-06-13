import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    url: String,
    name: String,
    type: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String
    },
    image: {
        type: String
    },
    file: fileSchema // <-- fix here
},{
    timestamps: true
});

const messageModel = new mongoose.model("Message", messageSchema);
export default messageModel