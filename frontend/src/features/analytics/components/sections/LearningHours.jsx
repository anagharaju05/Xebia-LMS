import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Q1', hours: 4000 },
  { name: 'Q2', hours: 3000 },
  { name: 'Q3', hours: 2000 },
  { name: 'Q4', hours: 2780 }
];

export default function LearningHours() {
  return (
    <AnalyticsLayout title="Learning Hours" subtitle="Detailed breakdown of hours invested in training.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="hours" stroke="var(--color-primary-bright)" fill="var(--color-primary)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
