import React, { useState } from 'react';

export default function TodoList() {
  const [tasks, setTasks] = useState([
    { text: 'Finish Algebra Homework', done: false },
    { text: 'Read Chapter 5 of Science Book', done: true },
    { text: 'Write History Essay', done: false },
    { text: 'Prepare English Presentation', done: true },
  ]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput('');
  };

  const toggleDone = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'pending') return matchesSearch && !t.done;
    if (filter === 'done') return matchesSearch && t.done;
    return matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>

      {/* Add Task */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-600">No tasks found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((t, i) => (
            <li
              key={i}
              className="todo-list-item flex items-center justify-between bg-white p-3 rounded shadow hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(i)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={t.done ? 'line-through text-gray-400' : ''}>
                  {t.text}
                </span>
              </div>
              <button
                onClick={() => deleteTask(i)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
