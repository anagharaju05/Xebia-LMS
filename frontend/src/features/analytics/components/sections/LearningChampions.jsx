import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function LearningChampions() {
  const { data: analytics, loading, error } = useAnalytics('learning-champions');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Learning Champions" subtitle="Top performers and knowledge sharers.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Active Learners</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.activeLearners || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Total active learners</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Badges</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.totalBadges || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Badges earned</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Top Champion Hours</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.championsList?.[0]?.hours || 0} hrs</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>By top performer</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Top 5 Scores</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.championsList || []} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card" style={{ flex: 2 }}>
            <div className="data-list-header">
              <h3>Top 5 Champions Leaderboard</h3>
            </div>
            {analytics.championsList?.length > 0 ? analytics.championsList.map((champion, i) => (
              <div key={i} className="data-list-row">
                <span className="data-list-title">
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{i + 1}</div>
                  {champion.name}
                </span>
                <span className="data-list-value">{champion.hours} hrs</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No champion data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Departments</h3>
            </div>
            {analytics.topDepartments?.length > 0 ? analytics.topDepartments.map((dept, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{dept.name}</span>
                <span className="data-list-value">{dept.hours} hrs</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No department data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
