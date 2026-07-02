import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function FlagshipPrograms() {
  const { data: analytics, loading, error } = useAnalytics('flagship-programs');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Flagship Programs" subtitle="Progress of our key organizational programs.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Programs</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.activePrograms || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Active flagship initiatives</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Overall Progress</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.programsData?.length > 0 ? Math.round(analytics.programsData.reduce((acc, curr) => acc + curr.progress, 0) / analytics.programsData.length) : 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Average completion rate</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Target</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.programsData?.length > 0 ? Math.round(analytics.programsData.reduce((acc, curr) => acc + curr.target, 0) / analytics.programsData.length) : 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Average target rate</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Program Completion</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.programsData || []} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="progress" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Performing Programs</h3>
            </div>
            {analytics.programsData?.length > 0 ? analytics.programsData.map((program, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{program.name}</span>
                <span className="data-list-value">{program.progress}%</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No program data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Program Targets</h3>
            </div>
            {analytics.programsData?.length > 0 ? analytics.programsData.map((program, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{program.name}</span>
                <span className="data-list-value">{program.target}% target</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No target data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
