import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

export default function TrainingEffectiveness() {
  const { data: analytics, loading, error } = useAnalytics('training-effectiveness');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!analytics) return null;

  return (
    <AnalyticsLayout title="Training Effectiveness" subtitle="Kirkpatrick Model evaluation scores.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>L1: Reaction</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.avgRating || 0}/5</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Average learner satisfaction</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>L2: Learning</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.knowledgeRetention || 0}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Passed post-assessments</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>NPS Score</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{analytics.npsScore || 0}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Net Promoter Score</div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>L4: Results</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-success)' }}>+14%</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Estimated productivity lift</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Course Effectiveness</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.effectivenessMetrics || []} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top Courses</h3>
            </div>
            {analytics.effectivenessMetrics?.length > 0 ? analytics.effectivenessMetrics.map((course, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">Course {course.name}</span>
                <span className="data-list-value">{course.score?.toLocaleString(undefined, { maximumFractionDigits: 1 })}/5</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No course data available</div>}
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Feedback Distribution</h3>
            </div>
            {analytics.feedbackDistribution?.length > 0 ? analytics.feedbackDistribution.map((feedback, i) => (
              <div className="data-list-row" key={i}>
                <span className="data-list-title">{feedback.rating}</span>
                <span className="data-list-value">{feedback.count} ratings</span>
              </div>
            )) : <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No feedback data available</div>}
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
