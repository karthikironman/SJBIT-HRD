import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const SUBTABS = [
  { id: 'core_info',      label: 'Core Info' },
  { id: 'personal_info',  label: 'Personal' },
  { id: 'official_info',  label: 'Official' },
  { id: 'schooling',      label: 'Schooling' },
  { id: 'current_scores', label: 'Scores' },
  { id: 'previous_edu',   label: 'Prev. Edu' },
  { id: 'documents',      label: 'Documents' },
];

const DOCUMENT_KEYS = [
  { id: 'resume',          label: 'Resume' },
  { id: 'marks_card_10th', label: '10th Marks Card' },
  { id: 'marks_card_12th', label: '12th Marks Card' },
  { id: 'ug_marks_card',   label: 'UG Marks Cards' },
  { id: 'pg_marks_card',   label: 'PG Marks Cards' },
  { id: 'pan_card',        label: 'PAN Card' },
  { id: 'aadhaar_card',    label: 'Aadhaar Card' },
  { id: 'passport_photo',  label: 'Passport Photo' },
  { id: 'college_id',      label: 'College ID' },
];

const STAFF_ROLES = ['ADMIN', 'SUPER_USER', 'FPC', 'SPC'];

const STATUS_META = {
  INCOMPLETE: { color: '#6B7280', bg: '#F3F4F6', label: 'Incomplete' },
  PENDING:    { color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  APPROVED:   { color: '#059669', bg: '#D1FAE5', label: 'Verified' },
  REJECTED:   { color: '#DC2626', bg: '#FEE2E2', label: 'Rejected' },
};

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.INCOMPLETE;
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.04em',
      color: meta.color, backgroundColor: meta.bg,
      padding: '0.15rem 0.45rem', borderRadius: '999px',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
};

const renderValue = (val) => {
  if (val === null || val === undefined || val === '') return <span style={{ color: '#9CA3AF' }}>—</span>;
  if (typeof val === 'boolean') return <span>{val ? 'Yes' : 'No'}</span>;
  if (typeof val === 'object') {
    return (
      <div style={{ marginLeft: '0.75rem', borderLeft: '2px solid #E5E7EB', paddingLeft: '0.75rem', marginTop: '0.2rem' }}>
        {Object.entries(val).map(([k, v]) => (
          <div key={k} style={{ marginBottom: '0.25rem' }}>
            <span style={{ color: '#6B7280', fontSize: '0.75rem', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}: </span>
            <span style={{ color: '#111827', fontSize: '0.8rem' }}>{renderValue(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
    return <a href={val} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline', wordBreak: 'break-all' }}>View Link</a>;
  }
  return <span style={{ wordBreak: 'break-word' }}>{String(val)}</span>;
};

const DataGrid = ({ data }) => {
  if (!data || !Object.keys(data).length)
    return <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No data available.</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
            {key.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#111827' }}>{renderValue(value)}</div>
        </div>
      ))}
    </div>
  );
};

const DocumentRow = ({ id, label, url, status, remark, isStaff, onApprove, onReject }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    setApproveLoading(true);
    try { await onApprove(id); } catch (err) { /* backend enforces */ }
    finally { setApproveLoading(false); }
  };

  const handleConfirm = async () => {
    if (!rejectRemark.trim()) { setError('Please enter a remark.'); return; }
    setRejectLoading(true);
    setError(null);
    try {
      await onReject(id, rejectRemark.trim());
      setRejecting(false);
      setRejectRemark('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setRejectLoading(false);
    }
  };

  const isPending  = status === 'PENDING';
  const isApproved = status === 'APPROVED';

  return (
    <div style={{
      border: '1px solid #E5E7EB', borderRadius: '0.5rem',
      overflow: 'hidden',
      backgroundColor: url ? '#fff' : '#F9FAFB',
    }}>
      {/* Main row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 0.875rem', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500', flexShrink: 0 }}>{label}</span>
          <StatusPill status={status || 'INCOMPLETE'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '0.75rem', fontWeight: '600', color: '#2563EB',
              textDecoration: 'none', backgroundColor: '#EFF6FF',
              padding: '0.2rem 0.6rem', borderRadius: '0.25rem',
            }}>
              View ⧉
            </a>
          )}
          {isStaff && (isPending || isApproved) && !rejecting && (
            <>
              {isPending && (
                <button onClick={handleApprove} disabled={approveLoading} style={{
                  fontSize: '0.72rem', fontWeight: '600', color: '#059669',
                  backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7',
                  padding: '0.2rem 0.55rem', borderRadius: '0.25rem',
                  cursor: approveLoading ? 'not-allowed' : 'pointer',
                  opacity: approveLoading ? 0.6 : 1,
                }}>
                  {approveLoading ? '…' : 'Approve'}
                </button>
              )}
              <button onClick={() => setRejecting(true)} style={{
                fontSize: '0.72rem', fontWeight: '600', color: '#DC2626',
                backgroundColor: '#FEE2E2', border: '1px solid #FECACA',
                padding: '0.2rem 0.55rem', borderRadius: '0.25rem', cursor: 'pointer',
              }}>
                Reject
              </button>
            </>
          )}
          {!url && <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Not uploaded</span>}
        </div>
      </div>

      {/* Rejection remark display */}
      {status === 'REJECTED' && remark && (
        <div style={{ padding: '0.3rem 0.875rem 0.5rem', borderTop: '1px solid #FEE2E2', backgroundColor: '#FFF5F5' }}>
          <span style={{ fontSize: '0.72rem', color: '#991B1B' }}>Remark: {remark}</span>
        </div>
      )}

      {/* Inline reject form */}
      {rejecting && (
        <div style={{ padding: '0.6rem 0.875rem', borderTop: '1px solid #FECACA', backgroundColor: '#FFF5F5' }}>
          <textarea
            value={rejectRemark}
            onChange={e => { setRejectRemark(e.target.value); setError(null); }}
            placeholder="Enter rejection remark…"
            rows={2}
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.4rem 0.5rem',
              border: '1px solid #FCA5A5', borderRadius: '0.375rem',
              fontSize: '0.78rem', resize: 'vertical',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {error && <p style={{ fontSize: '0.72rem', color: '#DC2626', margin: '0.2rem 0 0' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
            <button onClick={handleConfirm} disabled={loading} style={{
              fontSize: '0.75rem', fontWeight: '600', color: '#fff',
              backgroundColor: loading ? '#FCA5A5' : '#DC2626',
              border: 'none', padding: '0.25rem 0.7rem',
              borderRadius: '0.25rem', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Rejecting…' : 'Confirm'}
            </button>
            <button onClick={() => { setRejecting(false); setRejectRemark(''); setError(null); }} style={{
              fontSize: '0.75rem', color: '#6B7280', backgroundColor: 'transparent',
              border: '1px solid #D1D5DB', padding: '0.25rem 0.6rem',
              borderRadius: '0.25rem', cursor: 'pointer',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentsGrid = ({ docs, statuses, remarks, isStaff, onDocApprove, onDocReject }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
    {DOCUMENT_KEYS.map(({ id, label }) => (
      <DocumentRow
        key={id}
        id={id}
        label={label}
        url={docs[id]}
        status={statuses[id]}
        remark={remarks[id]}
        isStaff={isStaff}
        onApprove={onDocApprove}
        onReject={onDocReject}
      />
    ))}
  </div>
);

const StudentProfileModal = ({ student, onClose }) => {
  const { user } = useAuth();
  const isStaff = STAFF_ROLES.includes(user?.role);

  const [activeTab, setActiveTab] = useState('core_info');
  const [tabCache, setTabCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statuses, setStatuses] = useState(student.sub_tab_statuses || {});
  const [remarks, setRemarks] = useState(student.sub_tab_remarks || {});

  // Derive a single status for the documents tab from individual document keys
  const docStatuses = DOCUMENT_KEYS.map(({ id }) => statuses[id]).filter(Boolean);
  const documentsStatus = docStatuses.includes('REJECTED') ? 'REJECTED'
    : docStatuses.includes('PENDING')  ? 'PENDING'
    : docStatuses.length > 0 && docStatuses.every(s => s === 'APPROVED') ? 'APPROVED'
    : docStatuses.length > 0 ? 'PENDING'
    : 'INCOMPLETE';

  const getTabStatus = (tabId) =>
    tabId === 'documents' ? documentsStatus : (statuses[tabId] || 'INCOMPLETE');

  // Approve state
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject state
  const [rejectingTab, setRejectingTab] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (tabCache[activeTab]) return;
    setLoading(true);
    setError(null);

    const fetcher = activeTab === 'documents'
      ? Promise.all(
          DOCUMENT_KEYS.map(({ id }) =>
            apiClient.get(`/admin/student-data/${student.id}/${id}`)
              .then(res => ({ id, url: res.data?.data?.document_url || '' }))
              .catch(() => ({ id, url: '' }))
          )
        ).then(results =>
          setTabCache(prev => ({
            ...prev,
            documents: Object.fromEntries(results.map(r => [r.id, r.url])),
          }))
        )
      : apiClient.get(`/admin/student-data/${student.id}/${activeTab}`)
          .then(res => setTabCache(prev => ({ ...prev, [activeTab]: res.data?.data || {} })));

    fetcher
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, [activeTab, student.id, tabCache]);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await apiClient.post(`/admin/approve/${student.id}/${activeTab}`);
      setStatuses(prev => ({ ...prev, [activeTab]: 'APPROVED' }));
    } catch (err) {
      // silently fail — backend will respond with an error which the user can retry
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRemark.trim()) { setRejectError('Please enter a remark.'); return; }
    setRejectLoading(true);
    setRejectError(null);
    try {
      await apiClient.post(`/admin/reject/${student.id}/${rejectingTab}`, { remarks: rejectRemark.trim() });
      setStatuses(prev => ({ ...prev, [rejectingTab]: 'REJECTED' }));
      setRemarks(prev => ({ ...prev, [rejectingTab]: rejectRemark.trim() }));
      setRejectingTab(null);
      setRejectRemark('');
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject. Try again.');
    } finally {
      setRejectLoading(false);
    }
  };

  const data = tabCache[activeTab];
  const isDocumentsTab = activeTab === 'documents';
  const activeStatus = isDocumentsTab ? null : getTabStatus(activeTab);
  const activeRemark = remarks[activeTab];
  const isPending  = activeStatus === 'PENDING';
  const isApproved = activeStatus === 'APPROVED';
  const isRejecting = rejectingTab === activeTab;

  const handleDocApprove = async (docId) => {
    await apiClient.post(`/admin/approve/${student.id}/${docId}`);
    setStatuses(prev => ({ ...prev, [docId]: 'APPROVED' }));
  };

  const handleDocReject = async (docId, remark) => {
    await apiClient.post(`/admin/reject/${student.id}/${docId}`, { remarks: remark });
    setStatuses(prev => ({ ...prev, [docId]: 'REJECTED' }));
    setRemarks(prev => ({ ...prev, [docId]: remark }));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '0.75rem',
          width: '100%', maxWidth: '720px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111827' }}>
              {student.full_name || 'Unknown Student'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {student.usn && (
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  USN: <b style={{ color: '#374151' }}>{student.usn}</b>
                </span>
              )}
              {student.department && (
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Dept: <b style={{ color: '#374151' }}>{student.department}</b>
                </span>
              )}
              {student.email && (
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{student.email}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9CA3AF', padding: '0.25rem' }}
          >✕</button>
        </div>

        {/* Subtab nav */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid #E5E7EB',
          overflowX: 'auto',
          backgroundColor: '#F9FAFB',
        }}>
          {SUBTABS.map(tab => {
            const tabStatus = getTabStatus(tab.id);
            const meta = STATUS_META[tabStatus];
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setRejectingTab(null); setRejectRemark(''); setRejectError(null); }}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                  color: activeTab === tab.id ? '#2563EB' : '#6B7280',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                {tab.label}
                {meta && (
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    backgroundColor: meta.color, display: 'inline-block', flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: '200px' }}>

          {/* Status bar — always shown */}
          {activeStatus && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.65rem 0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: STATUS_META[activeStatus]?.bg || '#F3F4F6',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <StatusPill status={activeStatus} />
                {activeStatus === 'REJECTED' && activeRemark && (
                  <span style={{ fontSize: '0.78rem', color: '#7F1D1D', marginTop: '0.15rem' }}>
                    Remark: {activeRemark}
                  </span>
                )}
              </div>

              {/* Action buttons — staff only, not while reject form is open */}
              {isStaff && !isRejecting && (isPending || isApproved) && (
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {isPending && (
                    <button
                      onClick={handleApprove}
                      disabled={approveLoading}
                      style={{
                        fontSize: '0.75rem', fontWeight: '600',
                        color: '#059669', backgroundColor: '#D1FAE5',
                        border: '1px solid #6EE7B7',
                        padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
                        cursor: approveLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                        opacity: approveLoading ? 0.6 : 1,
                      }}
                    >
                      {approveLoading ? 'Approving…' : 'Approve'}
                    </button>
                  )}
                  <button
                    onClick={() => setRejectingTab(activeTab)}
                    style={{
                      fontSize: '0.75rem', fontWeight: '600',
                      color: '#DC2626', backgroundColor: '#FEE2E2',
                      border: '1px solid #FECACA',
                      padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Inline reject form */}
          {isRejecting && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.875rem 1rem',
              border: '1px solid #FECACA',
              borderRadius: '0.5rem',
              backgroundColor: '#FFF5F5',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#991B1B', marginBottom: '0.5rem' }}>
                Reason for rejection
              </div>
              <textarea
                value={rejectRemark}
                onChange={e => { setRejectRemark(e.target.value); setRejectError(null); }}
                placeholder="Enter remarks for the student…"
                rows={3}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.5rem 0.625rem',
                  border: '1px solid #FCA5A5', borderRadius: '0.375rem',
                  fontSize: '0.8rem', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              {rejectError && (
                <p style={{ fontSize: '0.75rem', color: '#DC2626', margin: '0.25rem 0 0' }}>{rejectError}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
                <button
                  onClick={handleReject}
                  disabled={rejectLoading}
                  style={{
                    fontSize: '0.78rem', fontWeight: '600',
                    color: '#fff', backgroundColor: rejectLoading ? '#FCA5A5' : '#DC2626',
                    border: 'none', padding: '0.35rem 0.875rem',
                    borderRadius: '0.375rem', cursor: rejectLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {rejectLoading ? 'Rejecting…' : 'Confirm Reject'}
                </button>
                <button
                  onClick={() => { setRejectingTab(null); setRejectRemark(''); setRejectError(null); }}
                  disabled={rejectLoading}
                  style={{
                    fontSize: '0.78rem', color: '#6B7280', backgroundColor: 'transparent',
                    border: '1px solid #D1D5DB', padding: '0.35rem 0.75rem',
                    borderRadius: '0.375rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>}
          {error && <p style={{ color: '#EF4444', textAlign: 'center' }}>{error}</p>}
          {!loading && !error && (
            activeTab === 'documents'
              ? <DocumentsGrid
                  docs={data || {}}
                  statuses={statuses}
                  remarks={remarks}
                  isStaff={isStaff}
                  onDocApprove={handleDocApprove}
                  onDocReject={handleDocReject}
                />
              : <DataGrid data={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
