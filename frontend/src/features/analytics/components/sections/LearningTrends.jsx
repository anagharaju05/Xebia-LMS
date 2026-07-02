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
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>14.2k</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Peak activity in March</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Completions</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>62%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Enrollment to completion ratio</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Busiest Time</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>Fridays</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Between 2 PM and 5 PM</div>
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
            <div className="data-list-row">
              <span className="data-list-title">Generative AI</span>
              <span className="data-list-value">↑ 340%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Cybersecurity</span>
              <span className="data-list-value">↑ 210%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Cloud Architecture</span>
              <span className="data-list-value">↑ 185%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Data Privacy</span>
              <span className="data-list-value">↑ 150%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Change Management</span>
              <span className="data-list-value">↑ 110%</span>
            </div>
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Declining Topics</h3>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Legacy Systems (Mainframe)</span>
              <span className="data-list-value">↓ 45%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Basic Office Skills</span>
              <span className="data-list-value">↓ 32%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">On-Premises Infrastructure</span>
              <span className="data-list-value">↓ 28%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Waterfall Methodology</span>
              <span className="data-list-value">↓ 25%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">General IT Support</span>
              <span className="data-list-value">↓ 15%</span>
            </div>
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
