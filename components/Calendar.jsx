import React, { useState } from 'react';
import Assignments from './Assignments.jsx';

export default function CalendarView() {
  const [date, setDate] = useState('');

  // Dummy today's assignments
  const todaysAssignments = [
    { title: 'Algebra Homework', subject: 'Math', due: '2025-09-17' },
    { title: 'Science Lab Report', subject: 'Science', due: '2025-09-17' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen calendar-layout">
      <h2 className="text-2xl font-bold mb-6">Study Calendar</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Calendar */}
        <div className="md:w-2/3 custom-card p-6">
          <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-6 text-gray-600">
            <p>Selected date: <span className="font-semibold">{date || 'None'}</span></p>
          </div>
        </div>

        {/* Right Column: Today's Assignments + Add Assignment */}
        <div className="md:w-1/3 flex flex-col gap-6">
          {/* Today's Assignments */}
          <div className="custom-card p-6">
            <h3 className="text-xl font-semibold mb-4">Today's Assignments</h3>
            {todaysAssignments.length === 0 ? (
              <p className="text-gray-600">No assignments for today.</p>
            ) : (
              <ul className="space-y-2">
                {todaysAssignments.map((a, i) => (
                  <li key={i} className="todo-list-item">
                    <span className="font-semibold">{a.title}</span> - {a.subject}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Assignment Form */}
          <div className="custom-card p-6">
            <h3 className="text-xl font-semibold mb-4">Add Assignment</h3>
            <Assignments />
          </div>
        </div>
      </div>
    </div>
  );
}
