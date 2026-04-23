import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import StudentProfileModal from './StudentProfileModal';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    apiClient.get(`/admin/search?q=${encodeURIComponent(q.trim())}`)
      .then(res => {
        setResults(res.data?.data || []);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (student) => {
    setSelected(student);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative', width: '280px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', fontSize: '0.875rem', pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search by name or USN…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.45rem 0.75rem 0.45rem 1.75rem',
              border: '1px solid #D1D5DB',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              color: '#111827',
            }}
          />
          {loading && (
            <span style={{
              position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.7rem', color: '#9CA3AF',
            }}>…</span>
          )}
        </div>

        {open && results.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1500,
            overflow: 'hidden',
          }}>
            {results.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.6rem 0.875rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#111827' }}>
                  {s.full_name || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No name</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                  {s.usn && (
                    <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                      USN: <b>{s.usn}</b>
                    </span>
                  )}
                  {s.department && (
                    <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                      Dept: <b>{s.department}</b>
                    </span>
                  )}
                  {s.pursuing_degree && (
                    <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>{s.pursuing_degree}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {open && !loading && query.trim().length >= 2 && results.length === 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            backgroundColor: '#fff', border: '1px solid #E5E7EB',
            borderRadius: '0.5rem', padding: '0.75rem 1rem',
            fontSize: '0.8rem', color: '#9CA3AF', textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1500,
          }}>
            No students found.
          </div>
        )}
      </div>

      {selected && (
        <StudentProfileModal student={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};

export default SearchBar;
