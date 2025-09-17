import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from '../components/Auth.jsx';
import Dashboard from '../components/Dashboard.jsx';
import ChatbotPage from '../components/Chatbot.jsx';

function App() {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Login / Sign Up */}
        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Auth
                setStudentName={setStudentName}
                setStudentId={setStudentId}
                setLoggedIn={setLoggedIn}
              />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            loggedIn ? (
              <Dashboard
                studentName={studentName}
                setLoggedIn={setLoggedIn}
                setStudentName={setStudentName}
                setStudentId={setStudentId}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* AI Chatbot */}
        <Route
          path="/ai-tutor"
          element={
            loggedIn ? (
              <ChatbotPage
                studentName={studentName}
                setLoggedIn={setLoggedIn}
                setStudentName={setStudentName}
                setStudentId={setStudentId}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
