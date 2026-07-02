import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Technical', value: 400 },
  { name: 'Leadership', value: 300 },
  { name: 'Soft Skills', value: 300 },
  { name: 'Compliance', value: 200 },
];
const COLORS = ['var(--chart-5)', 'var(--chart-7)', 'var(--chart-9)', 'var(--chart-10)'];

export default function LearningPillars() {
  return (
    <AnalyticsLayout title="Learning Pillars" subtitle="Distribution of learning across strategic pillars.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} fill="#8884d8" paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
