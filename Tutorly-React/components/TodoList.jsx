import React, { useState } from 'react';

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput('');
  };

  const toggleDone = index => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'pending') return matchesSearch && !t.done;
    if (filter === 'done') return matchesSearch && t.done;
    return matchesSearch;
  });

  return (
    <div>
      <h3>Todo List</h3>
      <input
        type="text"
        placeholder="New task..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={addTask}>Add</button>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
      </div>
      <ul>
        {filteredTasks.map((t, i) => (
          <li
            key={i}
            onClick={() => toggleDone(i)}
            style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}
          >
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
