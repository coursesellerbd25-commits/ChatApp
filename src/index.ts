import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
app.get("/", (_, res) => {
    res.send("Chat Server Running");
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on
})