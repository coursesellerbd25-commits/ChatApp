import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiU3VsdGFuYSIsImlhdCI6MTc4MDU0MTM0OSwiZXhwIjoxNzgwNTQ0OTQ5fQ.2Zto3EoaXoJHmWYoLBzIqn91PgcHxND3oe-W0eOtOAw"
    },
});

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [room, setRoom] = useState("general");
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [typingUser, setTypingUser] = useState("");

    useEffect(() => {
        fetch(`http://localhost:5000/messages/${room}`)
        .then((res) => res.json())
        .then((data) => {
            setMessages(data.map((msg: any) => msg.message));
        });
    }, [room]);
    
    useEffect(() => {
        socket.on("user-typing", (username: string) => {
            setTypingUser(username);
            setTimeout(() => {
                setTypingUser("");
            }, 1000);
        });
        socket.on(
            "receive-message",
            (message: string) => {
                setMessages((prev) => [
                    ...prev,
                    message,
                ]);
            }
        );

        socket.on("online-users", (count: number) => {
            setOnlineUsers(count);
        });

        return () => {
            socket.off("receive-message");
            socket.off("online-users");
            socket.off("user-typing");
        };
    }, []);

    useEffect(() => {
        if (socket.connected) {
        socket.emit("join-room", room);
}}, [room]);

    useEffect(() => {
        setMessages([]);
    }, [room]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit(
            "send-message",
            {
                room, 
                message,
            }
        );
        setMessage("");
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">
                Mini Discord 
            </h1>

            <p className="mb-4">
                Online Users: {onlineUsers}
            </p>

            <select 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="border p-2 mb-4"
            >
                <option value="general">#general</option>
                <option value="mern">#mern</option>
                <option value="career">#career</option>
            </select>

            {typingUser && (
                <p className="mb-2">
                    {typingUser} is typing... 
                </p>
            )}

            <div className="space-y-2 mb-6">
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className="border p-2 rounded"
                    >
                        {msg}
                    </div>
                ))}
            </div>
            
            <input 
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value)
                    socket.emit("typing", {
                        room, 
                        username: "Sultana",
                    });
                }}
                className="border p-2 mr-2"
                placeholder="Type message..."
            />

            <button 
                onClick={sendMessage}
                className="border px-4 py-2"
            >
                Send 
            </button>
        </div>
    );
}

export default App;