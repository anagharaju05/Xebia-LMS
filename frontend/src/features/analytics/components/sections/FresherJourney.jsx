import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function FresherJourney() {
  const { data: analytics, loading, error } = useAnalytics('fresher-journey');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Fresher Journey" subtitle="Tracking onboarding and deployment metrics for new hires.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Freshers Onboarded</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.totalFreshers?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Total this year</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Project Deployment</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.deploymentRate || 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Deployed to billable projects</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>Avg Time to Billable</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.avgTimeToDeploy || 0} days</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>From DOJ to billing</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Onboarding Progression</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.journeyMilestones || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="milestone" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="completion" stackId="1" stroke="var(--color-primary)" fill="var(--color-primary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Cohort Performance</h3>
            </div>
            <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>Coming Soon</div>
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Deployment by Tech Stack</h3>
            </div>
            <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>Coming Soon</div>
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
