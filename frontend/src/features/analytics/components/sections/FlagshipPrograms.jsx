import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Future Leaders', progress: 85 },
  { name: 'Tech Titans', progress: 60 },
  { name: 'Women in Tech', progress: 92 },
];

export default function FlagshipPrograms() {
  return (
    <AnalyticsLayout title="Flagship Programs" subtitle="Progress of our key organizational programs.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="progress" fill="var(--color-cta)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
