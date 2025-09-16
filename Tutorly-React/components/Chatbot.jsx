import React, { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { from: 'You', text: input },
      { from: 'Bot', text: `I heard you say '${input}'` },
    ]);
    setInput('');
  };

  return (
    <div>
      <h3>AI Chatbot</h3>
      <div style={{ border: '1px solid #000', height: '150px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <p key={i}>
            <b>{msg.from}:</b> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Ask something..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbot;
