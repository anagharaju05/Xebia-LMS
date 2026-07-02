import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';

export default function Certifications() {
  return (
    <AnalyticsLayout title="Certifications" subtitle="Global certification metrics and compliance.">
      <div className="dashboard-card" style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1, padding: '24px', background: 'var(--color-background)', borderRadius: '8px' }}>
          <h3>Total Active Certifications</h3>
          <h2 style={{ color: 'var(--color-primary)', fontSize: '48px', margin: '8px 0' }}>12,450</h2>
          <p style={{ color: 'var(--color-success)', fontWeight: 'bold', margin: 0 }}>↗ 15% increase</p>
        </div>
        <div style={{ flex: 2, padding: '24px' }}>
          <h4>Top Technologies</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}><span>AWS Cloud Practitioner</span><strong>2,100</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}><span>Azure Fundamentals</span><strong>1,850</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}><span>Google Cloud Associate</span><strong>1,200</strong></li>
          </ul>
        </div>
      </div>
    </AnalyticsLayout>
  );
}
