import React, { useState } from 'react';
import Calendar from 'react-calendar'; // install with: npm install react-calendar
import 'react-calendar/dist/Calendar.css';
import './styles.css'; //custom styling

export default function CalendarView({ assignments, setAssignments }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  // Format date to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Today's assignments
  const today = formatDate(new Date());
  const todaysAssignments = assignments.filter(a => a.due === today);

  // Add assignment
  const addAssignment = () => {
    if (!title.trim() || !subject) return;
    const newAssignment = {
      title,
      subject,
      due: formatDate(selectedDate),
      status: 'Pending',
      score: ''
    };
    setAssignments([...assignments, newAssignment]);
    setTitle('');
    setSubject('');
  };

  return (
    <div className="calendar-container">
      <h2 className="section-title">Study Calendar</h2>

      <div className="calendar-layout">
        {/* Left Column: Calendar */}
        <div className="calendar-column custom-card">
          <h3 className="sub-title">Select a Date</h3>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
          />
          <div className="selected-date">
            <p>
              Selected date: <span className="highlight">{formatDate(selectedDate)}</span>
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="side-column">
          {/* Today's Assignments */}
          <div className="custom-card">
            <h3 className="sub-title">Today's Assignments</h3>
            {todaysAssignments.length === 0 ? (
              <p className="placeholder-text">No assignments for today.</p>
            ) : (
              <ul className="todo-list">
                {todaysAssignments.map((a, i) => (
                  <li key={i} className="todo-list-item">
                    <span className="highlight">{a.title}</span> - {a.subject}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Assignment */}
          <div className="custom-card">
            <h3 className="sub-title">Add Assignment</h3>
            <input
              type="text"
              placeholder="Assignment Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="date-input"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="date-input"
              style={{ marginTop: '0.5rem' }}
            />
            <button onClick={addAssignment} className="quick-action-btn" style={{ marginTop: '0.75rem' }}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
