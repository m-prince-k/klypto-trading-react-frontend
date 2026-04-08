import React from 'react';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '$124,500', icon: TrendingUp, color: '#6366f1', trend: '+12%' },
    { label: 'Active Leads', value: '432', icon: Target, color: '#238636', trend: '+5%' },
    { label: 'New Contacts', value: '89', icon: Users, color: '#d29922', trend: '+18%' },
    { label: 'Task Completion', value: '76%', icon: Activity, color: '#f85149', trend: '-2%' },
  ];

  const recentActivity = [
    { id: 1, user: 'Sarah Chen', action: 'moved lead to Qualified', deal: 'Global Logistics', time: '2h ago' },
    { id: 2, user: 'Alex Rivier', action: 'added a note to', deal: 'Fintech Solutions', time: '4h ago' },
    { id: 3, user: 'Michael Scott', action: 'closed deal', deal: 'Paper Co.', time: '1d ago' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-label">{stat.label}</div>
              <div style={{ padding: '8px', backgroundColor: `${stat.color}20`, borderRadius: '8px', color: stat.color }}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: stat.trend.startsWith('+') ? '#238636' : '#f85149' }}>
              {stat.trend} <span style={{ color: '#8b949e' }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Chart Placeholder */}
        <div className="crm-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Revenue Growth</h3>
          <div style={{ height: '300px', width: '100%', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 100%)', borderRadius: '8px', border: '1px dashed #2d333b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
            [Interactive Chart Visualization]
          </div>
        </div>

        {/* Recent Activity */}
        <div className="crm-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentActivity.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', marginTop: '6px' }}></div>
                <div>
                  <div style={{ fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: '600' }}>{item.user}</span> {item.action} <span style={{ color: '#6366f1' }}>{item.deal}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
