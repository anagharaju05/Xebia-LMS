import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', score: 65 },
  { name: 'Feb', score: 68 },
  { name: 'Mar', score: 75 },
  { name: 'Apr', score: 82 },
];

export default function AiTransformation() {
  return (
    <AnalyticsLayout title="AI Transformation" subtitle="Tracking AI maturity and adoption across the enterprise.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="var(--color-success)" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
