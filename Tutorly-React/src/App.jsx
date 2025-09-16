import React, { useState } from 'react';
import Auth from '../components/Auth.jsx';
import Chatbot from '../components/Chatbot';
import TodoList from '../components/TodoList';
import CalendarView from '../components/Calendar';
import Assignments from '../components/Assignments';

function App() {
  const [user, setUser] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="app">
      {!loggedIn ? (
        <Auth setUser={setUser} setLoggedIn={setLoggedIn} />
      ) : (
        <div id="dashboard">
          <h1>AI Chatbot Tool & Dashboard</h1>
          <Chatbot />
          <TodoList />
          <CalendarView />
          <Assignments />
          {/* <Auth /> */}
        </div>
      )}
    </div>
  );
}

export default App;
