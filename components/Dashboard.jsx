import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Assignments from './Assignments.jsx';
import Progress from './Progress.jsx';

export default function Dashboard({ studentName, setLoggedIn, setStudentName, setStudentId }) {
  const [tab, setTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const metrics = ['Learning Sessions', 'Hours Learning', 'Problems Solved', 'Streaks'];

  const handleLogout = () => {
    setStudentName('');
    setStudentId('');
    setLoggedIn(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/tutorly-logo.jpg" alt="Tutorly Logo" className="logo-img" />
          <span className="logo-text">Tutorly</span>
        </div>

        <div className="nav-links">
          <Link to="/dashboard" className={tab === 'overview' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/ai-tutor">AI Tutor</Link>
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
              <button onClick={toggleDarkMode}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleLogout} style={{ color: 'red' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {studentName || 'Student'}!</h1>
        <p>Ready to continue your learning journey?</p>
        <Link to="/ai-tutor" className="ai-tutor-btn">Go to AI Tutor</Link>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, i) => (
          <div key={i} className="metric-card">
            <h2>{metric}</h2>
            <p>0</p>
          </div>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="secondary-nav">
        {['overview', 'assignments', 'progress'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={tab === item ? 'active-tab' : ''}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {tab === 'overview' && (
          <div className="overview-grid">
            <div className="content-card">Recent Activity</div>
            <div className="content-card">Achievements</div>
            <div className="content-card">Quick Actions</div>
            <div className="content-card">Daily Goal</div>
          </div>
        )}

        {tab === 'assignments' && (
          <div className="content-card">
            <Assignments />
          </div>
        )}

        {tab === 'progress' && (
          <div className="overview-grid">
            <div className="content-card">
              <Progress />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
