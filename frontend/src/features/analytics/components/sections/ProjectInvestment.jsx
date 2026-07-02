import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Project Alpha', investment: 125000, returns: 150000 },
  { name: 'Project Beta', investment: 80000, returns: 110000 },
  { name: 'Project Gamma', investment: 250000, returns: 310000 },
];

export default function ProjectInvestment() {
  return (
    <AnalyticsLayout title="Project Investment" subtitle="ROI mapping of training investments to projects.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="investment" fill="var(--color-primary-bright)" name="Training Cost ($)" />
            <Bar dataKey="returns" fill="var(--color-primary)" name="Project Value ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
