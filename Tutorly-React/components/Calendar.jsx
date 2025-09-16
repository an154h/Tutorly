import React, { useState } from 'react';

function CalendarView() {
  const [date, setDate] = useState('');
  return (
    <div>
      <h3>Calendar View</h3>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
    </div>
  );
}

export default CalendarView;
