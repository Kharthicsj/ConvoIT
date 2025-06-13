import mongoose from "mongoose";

const followerSchema = new mongoose.Schema({
    /*
        * userId => the user who owns this document (i.e., the one receiving requests)
        * requests => array of users who sent follow/message requests to this user
     */
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    blocked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, {
    timestamps: true
});

const followerModel = mongoose.model("Followers", followerSchema);
export default followerModel;
