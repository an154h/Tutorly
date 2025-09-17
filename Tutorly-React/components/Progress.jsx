import React from 'react';

export default function Progress() {
  const learningAnalytics = [
    { label: 'Completed', value: 12, color: 'bg-green-500' },
    { label: 'In Progress', value: 5, color: 'bg-blue-500' },
    { label: 'Pending', value: 3, color: 'bg-yellow-400' },
    { label: 'Overdue', value: 2, color: 'bg-red-500' },
  ];

  const performanceBySubject = [
    { subject: 'Math', progress: 85 },
    { subject: 'Science', progress: 72 },
    { subject: 'History', progress: 90 },
    { subject: 'English', progress: 65 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Learning Analytics */}
      <div className="custom-card p-6">
        <h2 className="text-xl font-semibold mb-4">Learning Analytics</h2>
        <div className="grid grid-cols-2 gap-4">
          {learningAnalytics.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg text-white flex flex-col justify-center items-center ${item.color}`}
            >
              <p className="font-bold text-lg">{item.value}</p>
              <p className="text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance by Subject */}
      <div className="custom-card p-6">
        <h2 className="text-xl font-semibold mb-4">Performance by Subject</h2>
        {performanceBySubject.map((sub, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{sub.subject}</span>
              <span className="font-semibold">{sub.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full bg-blue-500"
                style={{ width: `${sub.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
