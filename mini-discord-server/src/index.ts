import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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
const onlineUsers = new Set<string>();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
        next();
    } catch {
        next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    console.log("CONNECTED:", socket.id);
    onlineUsers.add(socket.id);
    console.log("ONLINE COUNT:", onlineUsers.size);
    io.emit("online-users", onlineUsers.size);
    
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
    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);
        io.emit("online-users", onlineUsers.size);
        console.log("Online:", onlineUsers.size);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});