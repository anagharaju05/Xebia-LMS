import React from 'react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';

export default function LearningChampions() {
  return (
    <AnalyticsLayout title="Learning Champions" subtitle="Top performers and knowledge sharers.">
      <div className="dashboard-card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '16px' }}>Rank</th>
              <th style={{ padding: '16px' }}>Employee</th>
              <th style={{ padding: '16px' }}>Hours</th>
              <th style={{ padding: '16px' }}>Certifications</th>
              <th style={{ padding: '16px' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((num) => (
              <tr key={num} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>#{num}</td>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-bright)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
                  <span>Employee Name {num}</span>
                </td>
                <td style={{ padding: '16px' }}>{120 - num * 10}</td>
                <td style={{ padding: '16px' }}>{6 - num}</td>
                <td style={{ padding: '16px', color: 'var(--color-primary)', fontWeight: 'bold' }}>{950 - num * 25}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsLayout>
  );
}
