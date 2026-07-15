import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function ProjectInvestment() {
  const { data: analytics, loading, error } = useAnalytics('project-investment');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Project Investment" subtitle="ROI mapping of training investments to projects.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Investment</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>${(analytics.totalInvestment / 1000000).toFixed(1)}M</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>YTD L&D spend</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Estimated ROI</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.roiPercentage}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Project value generated</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Cost per Learner</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>$350</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Average training cost</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Project Sessions</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.investmentData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="var(--color-primary-bright)" name="Sessions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Projects by Training Sessions</h3>
            </div>
            {analytics.investmentData?.length > 0 ? analytics.investmentData.map((project, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{project.name}</span>
                <span className="data-list-value">{project.sessions} sessions</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No project data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Highest Investment Areas</h3>
            </div>
            {analytics.highestInvestmentAreas?.length > 0 ? analytics.highestInvestmentAreas.map((area, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{area.name}</span>
                <span className="data-list-value">{area.cost}</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No investment data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
