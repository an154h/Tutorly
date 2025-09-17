import React, { useState } from 'react';

export default function Auth({ setStudentName, setStudentId, setLoggedIn }) {
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

  return (
    <div id="auth">
      <div className="card">
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Student ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <button onClick={login}>Login</button>

        {msg && <p className="error-msg">{msg}</p>}
      </div>
    </div>
  );
}
