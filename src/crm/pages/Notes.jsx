import React from 'react';
import { Search, Plus, Filter, SortAsc } from 'lucide-react';

const Notes = () => {
  const notes = [
    { 
      id: 1, 
      title: 'Initial Discovery Call', 
      content: 'Discussed cloud migration strategy. Client is interested in a 12-month contract. Budget is roughly $50k-$70k.', 
      date: 'Oct 11, 2026', 
      tag: 'Discovery' 
    },
    { 
      id: 2, 
      title: 'Security Concerns', 
      content: 'Client asked about SOC2 compliance and data residency in Europe. Need to follow up with the infra team.', 
      date: 'Oct 10, 2026', 
      tag: 'Technical' 
    },
    { 
      id: 3, 
      title: 'Pricing Feedback', 
      content: 'Talked to the CFO. They are comparing us with Salesforce. Need to highlight our modern stack advantages.', 
      date: 'Oct 08, 2026', 
      tag: 'Pricing' 
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Recent Notes</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161a21', border: '1px solid #2d333b', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <SortAsc size={16} /> Newest First
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <Plus size={16} /> Add Note
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {notes.map((note) => (
          <div key={note.id} className="crm-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{note.title}</h3>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#8b949e' }}>
                {note.date}
              </span>
            </div>
            <p style={{ color: '#8b949e', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              {note.content}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid #2d333b', color: '#6366f1' }}>
                #{note.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
