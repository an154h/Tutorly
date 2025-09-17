import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CalendarView from './Calendar.jsx';
import TodoList from './TodoList.jsx';
import { chatService } from '../src/services/apiServices.js';

export default function ChatbotPage({ setLoggedIn, setStudentName, studentName }) {
  const quickActions = [
    'Help with Math Problem',
    'Explain Science Concept',
    'Review My Essay',
    'History Homework Help',
    'Study Tips',
    'Assignment Planning'
  ];

  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: `Hi ${studentName || 'there'}! I'm Tutorly AI, your personal learning assistant. How can I help you study today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('ai-tutor');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use backend chat service
      const response = await chatService.sendMessage(input);
      
      const aiMessage = { sender: 'ai', text: response.response };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response failed:', error);
      const errorMessage = {
        sender: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to ask your question differently!"
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setInput(action);
    
    // Auto-send the quick action
    const userMessage = { sender: 'user', text: action };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(action);
      
      const aiMessage = { sender: 'ai', text: response.response };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response failed:', error);
      const errorMessage = {
        sender: 'ai',
        text: "I'm here to help with that! Could you provide more specific details about what you'd like assistance with?"
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  const handleLogout = () => {
    setStudentName('');
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
                    <button 
                      key={i} 
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* AI Status */}
              <div className="card mt-4">
                <h4>AI Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <span>{isLoading ? 'Thinking...' : 'Ready to help!'}</span>
                </div>
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="content-column ai-chat-column">
              <div className="card chat-card">
                <h3>Chat with Tutorly AI</h3>
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={msg.sender === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                      <div className="message-header">
                        <strong>{msg.sender === 'user' ? 'You' : 'Tutorly AI'}</strong>
                      </div>
                      <div className="message-content">
                        {msg.text.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="chat-message-ai">
                      <div className="message-header">
                        <strong>Tutorly AI</strong>
                      </div>
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-input-area">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about your studies..."
                    rows="3"
                    disabled={isLoading}
                    style={{ resize: 'none', width: '100%' }}
                  />
                  <button 
                    onClick={sendMessage} 
                    className="quick-action-btn"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
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