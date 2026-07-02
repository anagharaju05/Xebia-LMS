import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function LearningCoverage() {
  const { data, loading, error } = useAnalytics('learning-coverage');

  if (loading) {
    return (
      <AnalyticsLayout title="Learning Coverage" subtitle="Analysis of training penetration across business units.">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading coverage data...</div>
      </AnalyticsLayout>
    );
  }

  if (error || !data) {
    return (
      <AnalyticsLayout title="Learning Coverage" subtitle="Analysis of training penetration across business units.">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error loading dashboard: {error}</div>
      </AnalyticsLayout>
    );
  }

  return (
    <AnalyticsLayout title="Learning Coverage" subtitle="Analysis of training penetration across business units.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Learners</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.totalLearners.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Across all regions</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Coverage</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.avgCoverage}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Of total employee base</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Top Region</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.topRegionValue}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>{data.topRegionName}</div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Lowest Region</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{data.lowestRegionValue}%</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>{data.lowestRegionName}</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Coverage Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top 5 Covered Business Units</h3>
            </div>
            {data.topBUs.length > 0 ? data.topBUs.map((bu, index) => (
              <div className="data-list-row" key={index}>
                <span className="data-list-title">{bu.name}</span>
                <span className="data-list-value">{bu.value}%</span>
              </div>
            )) : (
              <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No business unit data available</div>
            )}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Bottom 5 Business Units</h3>
            </div>
            {data.bottomBUs.length > 0 ? data.bottomBUs.map((bu, index) => (
              <div className="data-list-row" key={index}>
                <span className="data-list-title">{bu.name}</span>
                <span className="data-list-value">{bu.value}%</span>
              </div>
            )) : (
              <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No business unit data available</div>
            )}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
