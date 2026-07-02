import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 200 },
  { name: 'Apr', value: 278 },
  { name: 'May', value: 189 },
  { name: 'Jun', value: 239 },
];

export default function LearningCoverage() {
  return (
    <AnalyticsLayout title="Learning Coverage" subtitle="Analysis of training penetration across business units.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
