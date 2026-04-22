import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../../api/apiClient';
import paginationConfig from '../../../../config/pagination.json';

const SUBTAB_LABELS = {
  core_info:      'Core Info',
  personal_info:  'Personal Info',
  official_info:  'Official Info',
  schooling:      'Schooling',
  current_scores: 'Current Scores',
  previous_edu:   'Previous Education',
};

const getSubtabLabel = (key) => {
  if (key.startsWith('offer_')) return `Offer #${key.replace('offer_', '')}`;
  return SUBTAB_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Renders any JSON value as a readable key-value block
const DataDisplay = ({ data }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No data available.</p>;
  }

  const renderValue = (val) => {
    if (val === null || val === undefined || val === '') return <span style={{ color: '#9CA3AF' }}>—</span>;
    if (typeof val === 'boolean') return <span>{val ? 'Yes' : 'No'}</span>;
    if (typeof val === 'object') {
      return (
        <div style={{ marginLeft: '1rem', borderLeft: '2px solid #E5E7EB', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>
          {Object.entries(val).map(([k, v]) => (
            <div key={k} style={{ marginBottom: '0.3rem' }}>
              <span style={{ color: '#6B7280', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {k.replace(/_/g, ' ')}:
              </span>{' '}
              <span style={{ color: '#111827', fontSize: '0.8rem' }}>{renderValue(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    // URL-like value
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
      return (
        <a href={val} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline', wordBreak: 'break-all' }}>
          View Link
        </a>
      );
    }
    return <span style={{ wordBreak: 'break-word' }}>{String(val)}</span>;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            {key.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#111827' }}>
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

// Modal overlay component
const ApprovalModal = ({ userId, studentName, subtabKey, onClose, onDone }) => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReject, setShowReject]       = useState(false);
  const [remarks, setRemarks]             = useState('');
  const [error, setError]                 = useState(null);
  const [feedback, setFeedback]           = useState(null);

  useEffect(() => {
    apiClient.get(`/admin/student-data/${userId}/${subtabKey}`)
      .then(res => setData(res.data?.data || {}))
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [userId, subtabKey]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await apiClient.post(`/admin/approve/${userId}/${subtabKey}`);
      setFeedback({ type: 'success', text: 'Approved successfully.' });
      setTimeout(() => { onDone(); onClose(); }, 900);
    } catch {
      setError('Failed to approve. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) { setError('Please enter remarks before rejecting.'); return; }
    setActionLoading(true);
    setError(null);
    try {
      await apiClient.post(`/admin/reject/${userId}/${subtabKey}`, { remarks });
      setFeedback({ type: 'error', text: 'Rejected successfully.' });
      setTimeout(() => { onDone(); onClose(); }, 900);
    } catch {
      setError('Failed to reject. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '0.75rem',
          width: '100%', maxWidth: '680px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>
              {getSubtabLabel(subtabKey)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.15rem' }}>
              {studentName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.25rem', color: '#9CA3AF', lineHeight: 1,
              padding: '0.25rem',
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading && <p style={{ color: '#6B7280', textAlign: 'center' }}>Loading data...</p>}
          {!loading && <DataDisplay data={data} />}

          {feedback && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: feedback.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              color: feedback.type === 'success' ? '#065F46' : '#B91C1C',
              fontSize: '0.875rem',
            }}>
              {feedback.text}
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {showReject && (
            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Rejection Remarks <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={remarks}
                onChange={e => { setRemarks(e.target.value); setError(null); }}
                placeholder="Enter reason for rejection..."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.6rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!feedback && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E5E7EB',
            display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
          }}>
            {!showReject ? (
              <>
                <button
                  onClick={() => { setShowReject(true); setError(null); }}
                  disabled={actionLoading}
                  style={{
                    padding: '0.5rem 1.25rem',
                    border: '1px solid #EF4444',
                    borderRadius: '0.375rem',
                    color: '#EF4444',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading || loading}
                  style={{
                    padding: '0.5rem 1.25rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    backgroundColor: actionLoading ? '#6EE7B7' : '#10B981',
                    color: '#fff',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setShowReject(false); setRemarks(''); setError(null); }}
                  disabled={actionLoading}
                  style={{
                    padding: '0.5rem 1.25rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.375rem',
                    color: '#374151',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  style={{
                    padding: '0.5rem 1.25rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    backgroundColor: actionLoading ? '#FCA5A5' : '#EF4444',
                    color: '#fff',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  }}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Approvals component
const Approvals = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [modal, setModal]     = useState(null); // { userId, studentName, subtabKey }
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = paginationConfig.DEFAULT_LIMIT;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient.get(`/admin/pending-approvals?page=${page}&limit=${limit}`)
      .then(res => {
        setRows(res.data?.data?.users || []);
        setTotalPages(res.data?.data?.pagination?.totalPages || 1);
      })
      .catch(() => setError('Failed to load pending approvals.'))
      .finally(() => setLoading(false));
  }, [page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading...</div>;
  if (error)   return <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>;

  if (rows.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', color: '#9CA3AF', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h3 style={{ margin: '0 0 0.5rem', color: '#6B7280', fontWeight: '600' }}>No Pending Approvals</h3>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>All student submissions are up to date.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              {['SL', 'Student Name', 'Pending Approvals'].map(col => (
                <th key={col} style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #E5E7EB',
                  whiteSpace: 'nowrap',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const pendingKeys = Object.entries(row.sub_tab_statuses || {})
                .filter(([, status]) => status === 'PENDING')
                .map(([key]) => key);

              const displayName = row.full_name || row.email;

              return (
                <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '0.875rem 1.5rem', color: '#9CA3AF', width: '3rem' }}>{idx + 1}</td>
                  <td style={{ padding: '0.875rem 1.5rem' }}>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{displayName}</div>
                    {row.full_name && (
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.15rem' }}>{row.email}</div>
                    )}
                    {row.usn && (
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{row.usn}</div>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {pendingKeys.map(key => (
                        <button
                          key={key}
                          onClick={() => setModal({ userId: row.id, studentName: displayName, subtabKey: key })}
                          style={{
                            padding: '0.3rem 0.75rem',
                            border: '1px solid #3B82F6',
                            borderRadius: '999px',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                        >
                          {getSubtabLabel(key)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Page {page} of {totalPages === 0 ? 1 : totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.35rem 0.75rem', backgroundColor: page === 1 ? '#F3F4F6' : '#FFF', border: '1px solid #D1D5DB', borderRadius: '0.375rem', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#9CA3AF' : '#374151', fontSize: '0.875rem' }}
          >Previous</button>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.35rem 0.75rem', backgroundColor: page >= totalPages ? '#F3F4F6' : '#FFF', border: '1px solid #D1D5DB', borderRadius: '0.375rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#9CA3AF' : '#374151', fontSize: '0.875rem' }}
          >Next</button>
        </div>
      </div>

      {modal && (
        <ApprovalModal
          userId={modal.userId}
          studentName={modal.studentName}
          subtabKey={modal.subtabKey}
          onClose={() => setModal(null)}
          onDone={fetchData}
        />
      )}
    </>
  );
};

export default Approvals;
