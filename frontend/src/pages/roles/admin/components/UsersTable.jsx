import React, { useState, useEffect } from 'react';
import apiClient from '../../../../api/apiClient';
import { ROLE_COLORS } from '../../../../config/roles';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/users')
      .then(res => setUsers(res.data?.data || []))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading...</div>;
  if (error)   return <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#F9FAFB' }}>
            {['#', 'Email', 'Role', 'Status', 'Joined'].map(col => (
              <th key={col} style={{
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #E5E7EB',
                whiteSpace: 'nowrap'
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '0.875rem 1.5rem', color: '#9CA3AF' }}>{idx + 1}</td>
              <td style={{ padding: '0.875rem 1.5rem', color: '#111827' }}>{u.email}</td>
              <td style={{ padding: '0.875rem 1.5rem' }}>
                <span style={{
                  backgroundColor: ROLE_COLORS[u.role] || '#6B7280',
                  color: 'white',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>{u.role}</span>
              </td>
              <td style={{ padding: '0.875rem 1.5rem' }}>
                <span style={{ color: u.is_active ? '#059669' : '#DC2626', fontWeight: '500' }}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '0.875rem 1.5rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
