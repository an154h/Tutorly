import React, { useState } from "react";
import "./App.css";

function App() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  // === Send Text Message ===
  const sendMessage = async () => {
    if (!message.trim()) return;

    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    const reply = data.reply && data.reply.trim() !== "" ? data.reply : "(No response from AI)";

    setChat([
      ...chat,
      { role: "student", text: message },
      { role: "tutor", text: reply },
    ]);

    setMessage("");
  };

  // === Send Image + Question ===
  const sendImage = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("question", message);
    formData.append("image", file);

    const res = await fetch("http://127.0.0.1:5000/chat-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    const reply = data.reply && data.reply.trim() !== "" ? data.reply : "(No response from AI)";

    setChat([
      ...chat,
      { role: "student", text: message || "(uploaded image)" },
      { role: "tutor", text: reply },
    ]);

    setMessage("");
    setFile(null);
  };

  return (
    <div className="chat-app">
      <h1>📘 AI Tutor</h1>
      <div className="chat-window">
        {chat.map((c, i) => (
          <p key={i} className={c.role}>
            <b>{c.role}:</b> {c.text}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your question..."
      />
      <button onClick={sendMessage}>Send</button>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={sendImage} disabled={!file}>
        Upload & Ask
      </button>
    </div>
  );
}

export default App;
