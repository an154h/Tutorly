import React, { useState } from 'react';
import { authService } from '../src/services/apiServices.js';

export default function Auth({ setStudentName, setLoggedIn }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const login = async () => {
    if (!name || !id || !password) {
      setMsg('Please enter Student Name, Student ID, and Password.');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const response = await authService.login({
        name: name.trim(),
        studentId: id.trim(),
        password: password
      });

      if (response.success) {
        setStudentName(response.user.name);
        setLoggedIn(true);
        setMsg('');
      } else {
        setMsg(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMsg('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async () => {
    if (!name || !id || !password) {
      setMsg('Please enter Student Name, Student ID, and Password.');
      return;
    }

    if (password.length < 6) {
      setMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setMsg('');

    try {
      const response = await authService.register({
        name: name.trim(),
        studentId: id.trim(),
        password: password
      });

      if (response.success) {
        setStudentName(response.user.name);
        setLoggedIn(true);
        setMsg('');
      } else {
        setMsg(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMsg('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth">
      <div className="card">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="text"
          placeholder="Student ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          onClick={isRegistering ? register : login}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
        </button>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMsg('');
          }}
          disabled={isLoading}
          style={{ marginTop: '10px', background: 'transparent', color: '#007bff', border: 'none' }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>

        {msg && <p className="error-msg">{msg}</p>}
      </div>
    </div>
  );
}
