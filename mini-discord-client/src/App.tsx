import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiU3VsdGFuYSIsImlhdCI6MTc4MDQ2Njk0NywiZXhwIjoxNzgwNDcwNTQ3fQ.ZXas5KoAzKLm5pRtSDQu1ardlHMH_jX8fdMQsBHVJsA"
    },
});

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [room, setRoom] = useState("general");
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
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
                onChange={(e) =>
                    setMessage(e.target.value)
                }
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