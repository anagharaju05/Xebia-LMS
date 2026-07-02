import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../useAnalytics.js';

const data = [
  { name: 'Jan', score: 65 },
  { name: 'Feb', score: 68 },
  { name: 'Mar', score: 75 },
  { name: 'Apr', score: 82 },
];

export default function AiTransformation() {
  const { data: aiData, loading, error } = useAnalytics('ai-transformation');

  if (loading) {
    return (
      <AnalyticsLayout title="AI Transformation" subtitle="Tracking AI maturity and adoption across the enterprise.">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading AI transformation data...</div>
      </AnalyticsLayout>
    );
  }

  if (error || !aiData) {
    return (
      <AnalyticsLayout title="AI Transformation" subtitle="Tracking AI maturity and adoption across the enterprise.">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error loading dashboard: {error}</div>
      </AnalyticsLayout>
    );
  }

  return (
    <AnalyticsLayout title="AI Transformation" subtitle="Tracking AI maturity and adoption across the enterprise.">
      
      <div className="analytics-grid-kpi">
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>AI Certifications</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{aiData.aiCertifications.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Across all units</div>
        </div>
        
        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>AI Trained</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{aiData.aiTrained.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Based on adoptions</div>
        </div>

        <div className="stat-card-purple">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>AI Learning Hours</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{aiData.aiLearningHours.toLocaleString()}</div>
          <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Direct training impact</div>
        </div>
      </div>

      <div className="analytics-grid-main">
        <div className="dashboard-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px' }}>Maturity Score Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--color-success)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-gap-24">
          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top GenAI Adoption by Unit</h3>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Data Science</span>
              <span className="data-list-value">95%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Engineering</span>
              <span className="data-list-value">88%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Product Management</span>
              <span className="data-list-value">75%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Marketing</span>
              <span className="data-list-value">62%</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">HR & Operations</span>
              <span className="data-list-value">45%</span>
            </div>
          </div>

          <div className="data-list-card">
            <div className="data-list-header">
              <h3>Top AI Champions</h3>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Alex Mercer</span>
              <span className="data-list-value">LLM Integration</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Sarah Jenkins</span>
              <span className="data-list-value">Prompt Engineering</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Raj Patel</span>
              <span className="data-list-value">AI Ethics</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Elena Rodriguez</span>
              <span className="data-list-value">Copilot Mastery</span>
            </div>
            <div className="data-list-row">
              <span className="data-list-title">Wei Chen</span>
              <span className="data-list-value">Machine Learning</span>
            </div>
          </div>
        </div>
      </div>

    </AnalyticsLayout>
  );
}
