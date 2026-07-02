import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';

export default function TrainingEffectiveness() {
  return (
    <AnalyticsLayout title="Training Effectiveness" subtitle="Kirkpatrick Model evaluation scores.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>L1: Reaction</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--color-primary)' }}>4.6/5</div>
        </div>
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>L2: Learning</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--color-primary)' }}>88%</div>
        </div>
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>L3: Behavior</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--color-primary)' }}>75%</div>
        </div>
        <div className="dashboard-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>L4: Results</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: 'var(--color-success)' }}>+14%</div>
        </div>
      </div>
    </AnalyticsLayout>
  );
}
