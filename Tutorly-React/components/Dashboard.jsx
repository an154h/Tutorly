import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Assignments from './Assignments.jsx';
import Progress from './Progress.jsx';

export default function Dashboard({ studentName, setLoggedIn, setStudentName, setStudentId }) {
  const [tab, setTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Logout function
  const handleLogout = () => {
    setStudentName('');
    setStudentId('');
    setLoggedIn(false);
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Navigation */}
      <nav className={`navbar shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Tutorly Logo" className="h-8 w-8" />
          <span className="logo font-bold text-lg">Tutorly</span>
        </div>

        <div className="nav-links flex space-x-4">
          <Link to="/dashboard" className={`nav-link ${tab === 'overview' ? 'active text-blue-500' : ''}`}>
            Dashboard
          </Link>
          <Link to="/ai-tutor" className="nav-link hover:text-blue-600">
            AI Tutor
          </Link>
        </div>

        {/* Profile Picture with Dropdown */}
        <div className="relative">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className={`absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <button
                onClick={toggleDarkMode}
                className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition rounded-t-lg"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-600 transition rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {studentName || 'Student'}!
        </h1>
        <p className="mb-4">Ready to continue your learning journey?</p>
        <Link to="/ai-tutor" className="btn-primary inline-block">
          Go to AI Tutor
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="metrics-grid px-6">
        {['Learning Sessions', 'Hours Learning', 'Problems Solved', 'Streaks'].map((item, i) => (
          <div key={i} className="custom-card text-center">
            <h2 className="text-xl font-semibold">{item}</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="secondary-nav">
        {['overview', 'assignments', 'progress'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`tab-btn ${tab === item ? 'tab-active' : 'tab-inactive'}`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="custom-card">Recent Activity</div>
            <div className="custom-card">Achievements</div>
            <div className="custom-card">Quick Actions</div>
            <div className="custom-card">Daily Goal</div>
          </div>
        )}

        {tab === 'assignments' && (
          <div className="custom-card">
            <Assignments />
          </div>
        )}

        {tab === 'progress' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Progress />
          </div>
        )}
      </div>
    </div>
  );
}
