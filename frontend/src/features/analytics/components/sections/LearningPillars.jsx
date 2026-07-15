import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

const COLORS = ['var(--chart-5)', 'var(--chart-7)', 'var(--chart-9)', 'var(--chart-10)'];

export default function LearningPillars() {
  const { data: analytics, loading, error } = useAnalytics('learning-pillars');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Learning Pillars" subtitle="Distribution of learning across strategic pillars.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Top Pillar</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.topPillarName || 'N/A'}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>{analytics.topPillarHours?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || 0} hours trained</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Fastest Growing</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>AI & GenAI</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>+140% vs last year</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Lowest Pillar</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>Compliance</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Requires immediate boost</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Pillar Distribution</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.pillarData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {(analytics.pillarData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Technical Programs</h3>
            </div>
            {analytics.topTechnicalPrograms?.length > 0 ? analytics.topTechnicalPrograms.map((prog, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{prog.name}</span>
                <span className="data-list-value">{prog.enrollments} enrollments</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Leadership Programs</h3>
            </div>
            {analytics.topLeadershipPrograms?.length > 0 ? analytics.topLeadershipPrograms.map((prog, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{prog.name}</span>
                <span className="data-list-value">{prog.enrollments} enrollments</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
