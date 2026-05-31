import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

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
        return () => {
            socket.off("receive-message");
        };
    }, []);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit(
            "send-message",
            message 
        );
        setMessage("");
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">
                Mini Discord 
            </h1>
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