import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import { server, app } from "./configs/socketio.js"
import router from "./routes/router.js"

dotenv.config()


app.use(cors({
    origin: [process.env.FRONT_END_URL, "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(router)

async function connectDb() {
    await mongoose.connect(process.env.MONGO_DB).then(() => {
        console.log("MongoDB Connected Successfully...")
    }).catch(() => {
        console.log("Error while Connecting MongoDB")
    })
}

const port = 5000
server.listen(port, () => {
    connectDb()
    console.log(`Server Running on Port ${port}`)
})
