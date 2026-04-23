import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import UsersTable from './components/UsersTable';
import Approvals from './components/Approvals';
import DashboardHeader from '../student/components/DashboardHeader';

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
        <DashboardHeader title={title} subtitle={subtitle} user={user} onLogout={onLogout} />

        {/* Content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {activeTabId === 'all-users' && <UsersTable currentUser={user} />}
            {activeTabId === 'approvals' && <Approvals />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
