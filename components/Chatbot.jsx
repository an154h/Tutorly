import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarView from './Calendar.jsx';
import TodoList from './TodoList.jsx';

export default function ChatbotPage({ setLoggedIn, setStudentName, setStudentId }) {
  const quickActions = [
    'Help with Math Problem',
    'Explain Science Concept',
    'Review My Essay',
    'History Homework Help',
  ];

  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('ai-tutor');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: input }]);
    setInput('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  const handleLogout = () => {
    setStudentName('');
    setStudentId('');
    setLoggedIn(false);
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/tutorly-logo.jpg" alt="Tutorly Logo" className="logo-img" />
          <span className="logo-text">Tutorly</span>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/ai-tutor" className="active">AI Tutor</Link>
        </div>
        <div className="profile-section">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="profile-img"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="dropdown">
              <button onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
              <button onClick={handleLogout} style={{ color: 'red' }}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      {/* Secondary Nav */}
      <div className="secondary-nav">
        {['ai-tutor', 'calendar', 'todo'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={tab === item ? 'active-tab' : ''}
          >
            {item === 'ai-tutor' ? 'AI Tutor' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {tab === 'ai-tutor' && (
          <div className="ai-tutor-layout">
            {/* Left: Quick Actions */}
            <div className="content-column quick-actions-column">
              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  {quickActions.map((action, i) => (
                    <button key={i} className="quick-action-btn">{action}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="content-column ai-chat-column">
              <div className="card chat-card">
                <h3>Chat with AI</h3>
                <div className="chat-messages">
                  {chatMessages.length === 0 ? (
                    <p className="placeholder-text">No messages yet.</p>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={msg.sender === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                        {msg.text}
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-input-area">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button onClick={sendMessage} className="quick-action-btn">Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="card">
            <CalendarView />
          </div>
        )}

        {tab === 'todo' && (
          <div className="card">
            <TodoList />
          </div>
        )}
      </div>
    </div>
  );
}
