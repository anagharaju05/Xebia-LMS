import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function LearningHours() {
  const { data: analytics, loading, error } = useAnalytics('learning-hours');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Learning Hours" subtitle="Detailed breakdown of hours invested in training.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Learning Hours</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.totalLearningHours?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Total organization hours</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Hours Per Employee</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.avgHoursPerEmployee || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Hours per employee headcount</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Hours Per Learner</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.avgHoursPerLearner || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Hours per active learner</div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Highest Avg Region</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{analytics.highestAvgRegionValue || 0} hrs</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Top region learning average</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Hours Trend (Quarterly)</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hoursTrendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="var(--color-primary-bright)" fill="var(--color-primary)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top 5 Learning-Focused Regions</h3>
            </div>
            {analytics.topRegions?.length > 0 ? analytics.topRegions.map((region, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{region.name}</span>
                <span className="data-list-value">{region.value} hrs</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No region data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top 5 Active Learners</h3>
            </div>
            {analytics.topLearners?.length > 0 ? analytics.topLearners.map((learner, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{learner.name}</span>
                <span className="data-list-value">{learner.hours} hrs</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No learner data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
