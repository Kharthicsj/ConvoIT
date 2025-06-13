import express from "express"
import tokenAuth from "../middleware/tokenAuth.js"
import Signup from "../controllers/Auth/Signup.js"
import Signin from "../controllers/Auth/Signin.js"
import searchUser from "../controllers/Users/SearchUsers.js"
import giveFollowRequest from "../controllers/Followers/GiveRequest.js"
import fetchLoggedInUserData from "../controllers/Users/fetchLoggedInUserData.js"
import denyRequest from "../controllers/Followers/denyRequest.js"
import AcceptRequest from "../controllers/Followers/AcceptRequest.js"
import getFollowers from "../controllers/Followers/GetFollowers.js"
import notificationModel from "../models/Notification.js"
import chatUserInfo from "../controllers/Users/chatUserInfo.js"
import sendMessage from "../controllers/Messages/sendMessage.js"
import fetchMessage from "../controllers/Messages/fetchMessage.js"
import clearChat from "../controllers/Messages/clearChat.js"
import blockUser from "../controllers/Users/blockUser.js"
import getRequestUsers from "../controllers/Followers/getRequestUsers.js";


const router = express.Router()

router.get("/", (req, res) => {
    res.send("Server is running successfully...")
})

router.post("/signup", Signup)
router.post("/signin", Signin)
router.post("/get-user", searchUser)

router.post("/follow/request", giveFollowRequest)
router.post("/follow/accept", AcceptRequest)
router.get("/follow/followers/:userId", getFollowers);
router.get("/follow/requests/:userId", getRequestUsers);


//Protected Routes
router.use(tokenAuth)
router.get("/loggedInUser", fetchLoggedInUserData)
router.post("/follow/deny", denyRequest)
router.get("/user/:id", chatUserInfo)
router.post("/user/block/:id", blockUser)

router.post("/message/send", sendMessage)
router.get("/message/:id", fetchMessage)
router.delete("/chat/clear/:id", clearChat)

router.get("/notifications", async (req, res) => {
    try {
        const userId = req.userData.userId;
        const notifications = await notificationModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .populate("fromUser", "username");

        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
});


export default router