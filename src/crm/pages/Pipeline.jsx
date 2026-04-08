import React from 'react';
import { MoreHorizontal, Plus, Calendar, DollarSign } from 'lucide-react';

const Pipeline = () => {
  const columns = [
    { title: 'New Leads', count: 4, deals: [
      { id: 1, title: 'Acme Corp Integration', company: 'Acme Corp', value: '$12,000', priority: 'High', date: 'Oct 12' },
      { id: 2, title: 'Retail Expansion', company: 'Global Retail', value: '$45,000', priority: 'Med', date: 'Oct 14' },
    ]},
    { title: 'Qualified', count: 2, deals: [
      { id: 3, title: 'Cloud Migration', company: 'Cloudly', value: '$8,500', priority: 'Low', date: 'Oct 10' },
    ]},
    { title: 'Proposal', count: 1, deals: [
      { id: 4, title: 'Security Audit', company: 'SafeGuard', value: '$15,000', priority: 'High', date: 'Oct 08' },
    ]},
    { title: 'Negotiation', count: 3, deals: [] },
  ];

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return '#f85149';
      case 'Med': return '#d29922';
      default: return '#238636';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Sales Pipeline</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ backgroundColor: '#161a21', border: '1px solid #2d333b', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>View All</button>
          <button style={{ backgroundColor: '#161a21', border: '1px solid #2d333b', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>Settings</button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map((col, idx) => (
          <div key={idx} className="kanban-column">
            <div className="kanban-header">
              <span>{col.title} ({col.count})</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Plus size={16} style={{ cursor: 'pointer' }} />
                <MoreHorizontal size={16} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem' }}>
              {col.deals.map((deal) => (
                <div key={deal.id} className="kanban-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: `${getPriorityColor(deal.priority)}20`, color: getPriorityColor(deal.priority), fontWeight: '600' }}>
                      {deal.priority}
                    </span>
                    <MoreHorizontal size={14} color="#8b949e" />
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{deal.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '1rem' }}>{deal.company}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d333b', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#8b949e' }}>
                      <DollarSign size={14} />
                      {deal.value}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#8b949e' }}>
                      <Calendar size={14} />
                      {deal.date}
                    </div>
                  </div>
                </div>
              ))}
              
              <button style={{ 
                width: '100%', 
                backgroundColor: 'transparent', 
                border: '1px dashed #2d333b', 
                color: '#8b949e', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}>
                + Add Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
