import React from 'react';

const Approvals = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      color: '#9CA3AF',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#6B7280', fontWeight: '600' }}>No Approvals Yet</h3>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>Pending student submissions will appear here.</p>
    </div>
  );
};

export default Approvals;
