import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function LearningTrends() {
  const { data: analytics, loading, error } = useAnalytics('learning-trends');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Learning Trends" subtitle="Time-series analysis of learning behaviors.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Monthly Active Learners</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.activeLearners?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Total unique learners</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Completions</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.avgCompletions || 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Enrollment to completion ratio</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Busiest Time</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.busiestTime || 'N/A'}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Peak activity period</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Enrollment vs Completion</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Fastest Growing Topics</h3>
            </div>
            {analytics.fastestGrowingTopics?.length > 0 ? analytics.fastestGrowingTopics.map((topic, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{topic.name}</span>
                <span className="data-list-value" style={{color: 'var(--color-success)'}}>{topic.value}</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Declining Topics</h3>
            </div>
            {analytics.decliningTopics?.length > 0 ? analytics.decliningTopics.map((topic, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{topic.name}</span>
                <span className="data-list-value" style={{color: 'var(--color-error)'}}>{topic.value}</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
