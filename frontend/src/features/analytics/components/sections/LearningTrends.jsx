import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', enrollments: 400, completions: 240 },
  { month: 'Feb', enrollments: 300, completions: 139 },
  { month: 'Mar', enrollments: 200, completions: 980 },
  { month: 'Apr', enrollments: 278, completions: 390 },
  { month: 'May', enrollments: 189, completions: 480 },
];

export default function LearningTrends() {
  return (
    <AnalyticsLayout title="Learning Trends" subtitle="Time-series analysis of learning behaviors.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="enrollments" stroke="var(--color-primary)" strokeWidth={2} />
            <Line type="monotone" dataKey="completions" stroke="var(--color-success)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
