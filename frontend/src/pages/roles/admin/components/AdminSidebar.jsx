import React from 'react';
import adminSidebarTabs from '../config/adminSidebarConfig';

const AdminSidebar = ({ activeTabId, onTabSelect }) => {
  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1F2937',
      color: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{
        padding: '1.5rem',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        borderBottom: '1px solid #374151'
      }}>
        {import.meta.env.VITE_BRAND_NAME || 'Admin'} Portal
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {adminSidebarTabs.map(tab => (
            <li key={tab.id}>
              <button
                onClick={() => onTabSelect(tab.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem 1.5rem',
                  backgroundColor: activeTabId === tab.id ? '#374151' : 'transparent',
                  color: activeTabId === tab.id ? '#60A5FA' : '#D1D5DB',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTabId === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
