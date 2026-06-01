import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());

app.get("/token", (_, res) => {
    const token = jwt.sign({ 
        userId: 1,
        username: "Sultana",
    },
    process.env.JWT_SECRET!,
    {
        expiresIn: "1h",
    });
    res.json({ token });
});

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
    let currentRoom = "general";
    socket.join(currentRoom);
    socket.on("join-room", (newRoom) => {
        socket.leave(currentRoom);
        socket.join(newRoom);
        currentRoom = newRoom;
        console.log(socket.id, "joined", newRoom);
    });
    console.log("User connected:", socket.id);
    socket.on("send-message", ({ room, message }) => {
        console.log("Message:", message);
        io.to(room).emit("receive-message", message);
    });
    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`${socket.id} joined ${room}`);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});