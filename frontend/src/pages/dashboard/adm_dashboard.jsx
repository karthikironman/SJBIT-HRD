import React, { useState } from 'react';
import AdminSidebar from './ADM/AdminSidebar';
import UsersTable from './ADM/UsersTable';
import Approvals from './ADM/Approvals';

const PAGE_TITLES = {
  'all-users': { title: 'All Users',  subtitle: 'View and manage all registered users.' },
  'approvals': { title: 'Approvals',  subtitle: 'Review and approve pending student submissions.' },
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTabId, setActiveTabId] = useState('all-users');
  const { title, subtitle } = PAGE_TITLES[activeTabId];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>

      <AdminSidebar activeTabId={activeTabId} onTabSelect={setActiveTabId} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 2rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{title}</h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>{subtitle}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              Logged in as <b>{user.email}</b> ({user.role})
            </span>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#EF4444', color: 'white', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {activeTabId === 'all-users' && <UsersTable />}
            {activeTabId === 'approvals' && <Approvals />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
