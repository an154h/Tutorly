import React, { useState } from 'react';

export default function Assignments() {
  // Dummy data
  const initialAssignments = [
    { title: 'Algebra Homework', subject: 'Math', due: '2025-09-20', status: 'Completed', difficulty: 'Medium', score: 95 },
    { title: 'Science Lab Report', subject: 'Science', due: '2025-09-22', status: 'In Progress', difficulty: 'Hard', score: '' },
    { title: 'History Essay', subject: 'History', due: '2025-09-25', status: 'Pending', difficulty: 'Medium', score: '' },
    { title: 'English Reading', subject: 'English', due: '2025-09-21', status: 'Overdue', difficulty: 'Easy', score: 70 },
  ];

  const [assignments, setAssignments] = useState(initialAssignments);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [due, setDue] = useState('');
  const [status, setStatus] = useState('Pending');
  const [difficulty, setDifficulty] = useState('Medium');
  const [score, setScore] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const addAssignment = () => {
    if (!title.trim() || !subject || !due) return;
    setAssignments([...assignments, { title, subject, due, status, difficulty, score }]);
    setTitle(''); setSubject(''); setDue(''); setStatus('Pending'); setDifficulty('Medium'); setScore('');
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const filteredAssignments = assignments.filter((a) => 
    a.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === '' || a.status === filterStatus)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Assignment Database</h2>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Add Assignment Form */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
        <input
          type="text" placeholder="Assignment Title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date" value={due} onChange={(e) => setDue(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Overdue</option>
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <input
          type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)}
          className="border p-2 rounded w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={addAssignment} className="btn-primary">Add</button>
      </div>

      {/* Assignment Table */}
      {filteredAssignments.length === 0 ? (
        <p className="text-gray-600">No assignments found.</p>
      ) : (
        <div className="overflow-x-auto custom-card">
          <table className="assignment-table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Assignment','Subject','Due Date','Status','Difficulty','Score','Actions'].map((head) => (
                  <th key={head} className="px-6 py-3 text-left text-sm font-medium text-gray-700">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{a.title}</td>
                  <td className="px-6 py-4">{a.subject}</td>
                  <td className="px-6 py-4">{a.due}</td>
                  <td className="px-6 py-4">{a.status}</td>
                  <td className="px-6 py-4">{a.difficulty}</td>
                  <td className="px-6 py-4">{a.score}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => removeAssignment(i)} className="text-red-500 hover:text-red-700 font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
