import React, { useState } from 'react';

export default function Assignments() {
  // Dummy data
  const initialAssignments = [
    { title: 'Algebra Homework', subject: 'Math', due: '2025-09-20', status: 'Completed', score: 95 },
    { title: 'Science Lab Report', subject: 'Science', due: '2025-09-22', status: 'In Progress', score: '' },
    { title: 'History Essay', subject: 'History', due: '2025-09-25', status: 'Pending', score: '' },
    { title: 'English Reading', subject: 'English', due: '2025-09-21', status: 'Overdue', score: 70 },
  ];

  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const subjects = Array.from(new Set(assignments.map(a => a.subject)));

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === '' || a.status === filterStatus) &&
    (filterSubject === '' || a.subject === filterSubject)
  );

  return (
    <div className="main-content">
      <h2 className="section-title">Assignment Database</h2>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="filter-select"
        >
          <option value="">All Subjects</option>
          {subjects.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Assignment Table */}
      {filteredAssignments.length === 0 ? (
        <p className="placeholder-text">No assignments found.</p>
      ) : (
        <div className="custom-card">
          <table className="assignment-table">
            <thead>
              <tr>
                {['Assignment', 'Subject', 'Due Date', 'Status', 'Score', 'Actions'].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a, i) => (
                <tr key={i}>
                  <td>{a.title}</td>
                  <td>{a.subject}</td>
                  <td>{a.due}</td>
                  <td>{a.status}</td>
                  <td>{a.score}</td>
                  <td>
                    <button onClick={() => removeAssignment(i)} className="delete-btn">
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
