import React, { useState } from 'react';

function Auth({ setUser, setLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const login = () => {
    if (!username) return;
    setUser(username);
    setLoggedIn(true);
  };

  const signup = () => {
    setMsg('Account created! Please login.');
  };

  return (
    <section id="auth">
      <h2>Login / Sign Up</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
      <button onClick={signup}>Sign Up</button>
      <p>{msg}</p>
    </section>
  );
}

export default Auth;
