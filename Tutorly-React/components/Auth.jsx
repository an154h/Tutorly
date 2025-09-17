import React, { useState } from 'react';

function Auth({ setStudentName, setStudentId, setLoggedIn }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [msg, setMsg] = useState('');

  const login = () => {
    if (!name || !id) {
      setMsg('Please enter both Student Name and Student ID.');
      return;
    }
    setStudentName(name);
    setStudentId(id);
    setLoggedIn(true);
  };

  const signup = () => {
    if (!name || !id) {
      setMsg('Please enter both fields to create an account.');
      return;
    }
    setMsg('Account created! Please login.');
  };

  return (
    <section id="auth" className="flex flex-col items-center justify-center min-h-screen">
      <div className="custom-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login / Sign Up</h2>

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Student ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border p-2 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-4 mb-4">
          <button type="button" onClick={login} className="btn-primary flex-1">
            Login
          </button>
          <button
            type="button"
            onClick={signup}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition flex-1"
          >
            Sign Up
          </button>
        </div>

        {msg && <p className="text-red-500 text-center">{msg}</p>}
      </div>
    </section>
  );
}

export default Auth;
