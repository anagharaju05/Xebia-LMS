import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Month 1', retention: 100, engagement: 85 },
  { month: 'Month 2', retention: 98, engagement: 88 },
  { month: 'Month 3', retention: 95, engagement: 92 },
  { month: 'Month 6', retention: 90, engagement: 95 },
];

export default function FresherJourney() {
  return (
    <AnalyticsLayout title="Fresher Journey" subtitle="Tracking onboarding and deployment metrics for new hires.">
      <div className="dashboard-card" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="retention" stackId="1" stroke="var(--color-primary-dark)" fill="var(--color-primary-dark)" />
            <Area type="monotone" dataKey="engagement" stackId="1" stroke="var(--color-primary)" fill="var(--color-primary)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsLayout>
  );
}
