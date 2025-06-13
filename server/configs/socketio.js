import { Server } from "socket.io";
import http from "http"
import express from "express"

import dotenv from "dotenv"
dotenv.config()

const app = express()
const server = http.createServer(app)

const onlineUsers = new Set();


const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", process.env.FRONT_END_URL],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }
})

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        socket.userId = userId;
        onlineUsers.add(userId);
        socket.join(userId)
        io.emit("online-users", Array.from(onlineUsers));
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit("online-users", Array.from(onlineUsers));
        }
    });
});


export { io, server, app };