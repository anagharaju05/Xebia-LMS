import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function Certifications() {
  const { data: analytics, loading, error } = useAnalytics('certifications');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Certifications" subtitle="Global certification metrics and compliance.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Total Certifications</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.totalCertifications?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Active industry certifications</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Growth</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>+{analytics.certificationGrowth || 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Compared to last year</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Most Popular</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.topTechnologies?.[0]?.name || 'N/A'}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Top technology tracked</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Top Certifications</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topTechnologies || []} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={50} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Providers</h3>
            </div>
            {analytics.topTechnologies?.length > 0 ? analytics.topTechnologies.map((tech, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{tech.name}</span>
                <span className="data-list-value">{tech.count?.toLocaleString()}</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No provider data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Recently Certified</h3>
            </div>
            {analytics.recentCertifications?.length > 0 ? analytics.recentCertifications.map((cert, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{cert.studentName}</span>
                <span className="data-list-value">{cert.certification}</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No recent certifications available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
