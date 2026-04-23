import React from 'react';
import SearchBar from '../../../../components/ui/SearchBar';

const SEARCH_ROLES = ['ADMIN', 'SUPER_USER', 'FPC', 'SPC'];

const DashboardHeader = ({ title, subtitle, user, onLogout }) => (
  <div style={{
    backgroundColor: '#FFFFFF',
    padding: '1rem 2rem',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }}>
    <div style={{ flexShrink: 0 }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{title}</h1>
      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>{subtitle}</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
      {SEARCH_ROLES.includes(user.role) && <SearchBar />}
      <span style={{ fontSize: '0.875rem', color: '#374151', whiteSpace: 'nowrap' }}>
        Logged in as <b>{user.email}</b> ({user.role})
      </span>
      <button
        onClick={onLogout}
        style={{
          backgroundColor: '#EF4444', color: 'white', border: 'none',
          padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}
      >
        Logout
      </button>
    </div>
  </div>
);

export default DashboardHeader;
