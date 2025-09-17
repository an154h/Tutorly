import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarView from './Calendar.jsx';
import TodoList from './TodoList.jsx';

export default function ChatbotPage({ user, setLoggedIn }) {
  const quickActions = [
    'Help with Math Problem',
    'Explain Science Concept',
    'Review My Essay',
    'History Homework Help',
  ];

  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: input }]);
    setInput('');
    // Later: add AI response logic
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = () => {
    setStudentName('');
    setStudentId('');
    setLoggedIn(false); // this triggers redirect to /login
  };


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Navigation */}
      <nav className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 shadow navbar">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Tutorly Logo" className="h-8 w-8" />
          <span className="font-bold text-lg logo-text">Tutorly</span>
        </div>
        <div className="flex space-x-6 nav-links">
          <Link to="/dashboard" className="nav-link hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/ai-tutor" className="nav-link active hover:text-blue-600">
            AI Tutor
          </Link>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
              <button
                onClick={toggleDarkMode}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Header */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">AI Tutor</h2>
      </div>

      {/* Main Content */}
      <div className="chatbot-container px-6 flex flex-col md:flex-row gap-6">
        {/* Left Column: Quick Actions + Chat */}
        <div className="md:w-2/3 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <button key={i} className="quick-action-btn">
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div className="card flex flex-col h-96">
            <h3 className="text-xl font-semibold mb-4">Chat with AI</h3>
            <div className="chat-messages mb-4 overflow-y-auto flex-1">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No messages yet.</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={
                      msg.sender === 'user'
                        ? 'chat-message-user'
                        : 'chat-message-ai'
                    }
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar + TodoList */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div className="card">
            <CalendarView />
          </div>
          <div className="card">
            <TodoList />
          </div>
        </div>
      </div>
    </div>
  );
}
