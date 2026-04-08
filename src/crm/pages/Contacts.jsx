import React from 'react';
import { Mail, Phone, ExternalLink, Filter, Download } from 'lucide-react';

const Contacts = () => {
  const contacts = [
    { id: 1, name: 'Robert Fox', email: 'robert.f@example.com', phone: '+1 (555) 123-4567', company: 'Global Tech', status: 'Active', avatar: 'RF' },
    { id: 2, name: 'Jane Cooper', email: 'jane.c@startup.io', phone: '+1 (555) 987-6543', company: 'Innovate LLC', status: 'Qualified', avatar: 'JC' },
    { id: 3, name: 'Cody Fisher', email: 'cody.fisher@design.com', phone: '+1 (555) 333-2222', company: 'Design Pros', status: 'Lead', avatar: 'CF' },
    { id: 4, name: 'Esther Howard', email: 'esther.h@bank.com', phone: '+1 (555) 444-5555', company: 'Capital Trust', status: 'Active', avatar: 'EH' },
    { id: 5, name: 'Jenny Wilson', email: 'jenny.w@web.com', phone: '+1 (555) 666-7777', company: 'Web Solutions', status: 'Lost', avatar: 'JW' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: '#23863620', color: '#238636' };
      case 'Qualified': return { bg: '#6366f120', color: '#6366f1' };
      case 'Lead': return { bg: '#d2992220', color: '#d29922' };
      case 'Lost': return { bg: '#f8514920', color: '#f85149' };
      default: return { bg: '#8b949e20', color: '#8b949e' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Contacts</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161a21', border: '1px solid #2d333b', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#161a21', border: '1px solid #2d333b', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="crm-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2d333b' }}>
            <tr>
              <th style={{ padding: '16px', color: '#8b949e', fontWeight: '600', fontSize: '0.85rem' }}>NAME</th>
              <th style={{ padding: '16px', color: '#8b949e', fontWeight: '600', fontSize: '0.85rem' }}>COMPANY</th>
              <th style={{ padding: '16px', color: '#8b949e', fontWeight: '600', fontSize: '0.85rem' }}>STATUS</th>
              <th style={{ padding: '16px', color: '#8b949e', fontWeight: '600', fontSize: '0.85rem' }}>CONTACT INFO</th>
              <th style={{ padding: '16px', color: '#8b949e', fontWeight: '600', fontSize: '0.85rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} style={{ borderBottom: '1px solid #2d333b', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6366f120', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
                      {contact.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{contact.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Last seen 2d ago</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.9rem' }}>{contact.company}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    backgroundColor: getStatusStyle(contact.status).bg,
                    color: getStatusStyle(contact.status).color
                  }}>
                    {contact.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', color: '#8b949e' }}>
                    <Mail size={16} style={{ cursor: 'pointer' }} />
                    <Phone size={16} style={{ cursor: 'pointer' }} />
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <ExternalLink size={16} color="#8b949e" style={{ cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};

export default Contacts;
