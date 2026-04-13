import React from 'react';

const DashboardHeader = ({ title, subtitle, user, onLogout }) => (
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
);

export default DashboardHeader;
