import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

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

const DocumentsGrid = ({ docs }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
    {DOCUMENT_KEYS.map(({ id, label }) => {
      const url = docs[id];
      return (
        <div key={id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.6rem 0.875rem',
          border: '1px solid #E5E7EB',
          borderRadius: '0.5rem',
          backgroundColor: url ? '#F0FDF4' : '#F9FAFB',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: '500' }}>{label}</span>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem', fontWeight: '600',
                color: '#2563EB', textDecoration: 'none',
                backgroundColor: '#EFF6FF',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.25rem',
                whiteSpace: 'nowrap',
              }}
            >
              View ⧉
            </a>
          ) : (
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Not uploaded</span>
          )}
        </div>
      );
    })}
  </div>
);

const StudentProfileModal = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState('core_info');
  const [tabCache, setTabCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const data = tabCache[activeTab];

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
          {SUBTABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, minHeight: '200px' }}>
          {loading && <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>}
          {error && <p style={{ color: '#EF4444', textAlign: 'center' }}>{error}</p>}
          {!loading && !error && (
            activeTab === 'documents'
              ? <DocumentsGrid docs={data || {}} />
              : <DataGrid data={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
