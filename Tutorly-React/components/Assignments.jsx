import React, { useState } from 'react';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const addAssignment = () => {
    if (!title.trim() || !due) return;
    setAssignments([...assignments, { title, due }]);
    setTitle('');
    setDue('');
  };

  return (
    <div>
      <h3>Assignment Database</h3>
      <input
        type="text"
        placeholder="Assignment Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={due}
        onChange={e => setDue(e.target.value)}
      />
      <button onClick={addAssignment}>Add Assignment</button>
      <ul>
        {assignments.map((a, i) => (
          <li key={i}>
            {a.title} - Due: {a.due}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Assignments;
