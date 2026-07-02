import React from 'react';
import { Users, Rocket, Activity, ChevronRight, Award } from 'lucide-react';
import AnalyticsLayout from '../../AnalyticsLayout.jsx';
import { useAnalytics } from '../../useAnalytics.js';

export default function ExecutiveSummary() {
  const { data, loading, error } = useAnalytics('executive-summary');

  if (loading) {
    return (
      <AnalyticsLayout title="L&D Analytics" subtitle="A comprehensive overview of learning impact.">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard data...</div>
      </AnalyticsLayout>
    );
  }

  if (error || !data) {
    return (
      <AnalyticsLayout title="L&D Analytics" subtitle="A comprehensive overview of learning impact.">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error loading dashboard: {error}</div>
      </AnalyticsLayout>
    );
  }

  return (
    <AnalyticsLayout title="L&D Analytics" subtitle="A comprehensive overview of learning impact.">
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header-flex">
            <h3>Learning Reach</h3>
            <Users size={20} color="var(--color-text-secondary)" />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', marginTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Employees</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{data.totalEmployees.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Nominated</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{data.nominatedEmployees.toLocaleString()}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Trained</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{data.trainedEmployees.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center', borderBottom: '4px solid var(--color-primary)', paddingBottom: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{data.coveragePercentage}%</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>COVERAGE</div>
            </div>
          </div>
        </div>

        <div className="stat-card-purple">
          <div className="card-header-flex" style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#fff' }}>Learning Delivery</h3>
            <Rocket size={20} color="rgba(255,255,255,0.8)" />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Total<br/>Sessions</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{data.totalSessions.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Total<br/>Attendees</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{data.totalAttendees.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Nominations</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{data.nominatedEmployees.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Learning<br/>Hours</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.totalLearningHours.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Avg<br/>Hours/Session</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{data.avgHoursPerSession}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="stat-card-purple" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> AI Readiness Summary</h3>
            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.5, margin: 0, maxWidth: '80%', color: 'var(--color-text-on-primary)' }}>Current progress of our organization-wide AI literacy and certification initiative.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '48px', marginTop: '32px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.aiTrained.toLocaleString()}</div>
              <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'bold', letterSpacing: '0.5px' }}>EMPLOYEES TRAINED</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.aiCertifications.toLocaleString()}</div>
              <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'bold', letterSpacing: '0.5px' }}>CERTIFICATIONS</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.aiLearningHours.toLocaleString()}</div>
              <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 'bold', letterSpacing: '0.5px' }}>AI LEARNING HOURS</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header-flex">
            <h3>Effectiveness</h3>
            <Activity size={20} color="var(--color-text-secondary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Avg Rating</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{data.avgFeedbackScore} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>/ 5</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Satisfaction</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)' }}>{data.satisfactionScore}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Recommendation</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{data.recommendationPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>CERTIFICATIONS<br/>COMPLETED</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '12px' }}>{data.totalCertifications.toLocaleString()}</div>
          <div style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 'bold' }}>↗ +{data.certificationGrowth}% vs last Year</div>
        </div>
      </div>

      <div className="dashboard-card" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Strategic Learning Pillars</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>Mapping our organizational growth across 7 key focus areas.</p>
          </div>
          <a href="#" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>View Full Strategy <ChevronRight size={16} /></a>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px', flexWrap: 'wrap', gap: '16px' }}>
          {[
            { icon: Award, label: 'Innovation' },
            { icon: Users, label: 'Leadership' },
            { icon: Rocket, label: 'Digital Literacy' },
            { icon: Activity, label: 'ESG Compliance' },
            { icon: Users, label: 'Soft Skills' },
            { icon: Award, label: 'Technical Skill' },
            { icon: Users, label: 'Diversity & Inc.' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <item.icon size={24} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-primary)', textAlign: 'center', maxWidth: '80px', lineHeight: 1.2 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsLayout>
  );
}
