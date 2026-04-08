import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  NotebookPen, 
  Settings, 
  Bell, 
  Search,
  Plus
} from 'lucide-react';
import './crm.css';

// Sub-pages (we will create these next)
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Contacts from './pages/Contacts';
import Notes from './pages/Notes';

const CRMContainer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', name: 'Leads Pipeline', icon: Kanban },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'notes', name: 'Notes', icon: NotebookPen },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'pipeline': return <Pipeline />;
      case 'contacts': return <Contacts />;
      case 'notes': return <Notes />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="crm-wrapper">
      {/* Sidebar */}
      <aside className="crm-sidebar">
        <div className="crm-logo">
          <div style={{ backgroundColor: '#6366f1', height: '32px', width: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>K</span>
          </div>
          <span>Klypto CRM</span>
        </div>

        <nav>
          {navigation.map((item) => (
            <div
              key={item.id}
              className={`crm-nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="crm-nav-link">
            <Settings size={20} />
            <span>Workspace Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="crm-content">
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#8b949e' }} />
            <input 
              type="text" 
              placeholder="Search leads, contacts, tasks..." 
              style={{ 
                width: '100%', 
                backgroundColor: '#161a21', 
                border: '1px solid #2d333b', 
                borderRadius: '8px', 
                padding: '8px 12px 8px 40px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button style={{ 
              backgroundColor: '#6366f1', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              <Plus size={18} />
              New Lead
            </button>
            <div style={{ color: '#8b949e', cursor: 'pointer' }}>
              <Bell size={20} />
            </div>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#444c56', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              JD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CRMContainer;
