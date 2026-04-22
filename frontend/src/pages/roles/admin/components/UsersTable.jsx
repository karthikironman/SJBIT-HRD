import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../../api/apiClient';
import { ROLE_COLORS } from '../../../../config/roles';
import enums from '../../../../config/enums.json';
import paginationConfig from '../../../../config/pagination.json';

import { createPortal } from 'react-dom';

const DEPARTMENT_OPTIONS = enums.DEPARTMENT_BRANCH.map(opt => opt.value);

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target) && !event.target.closest('.multi-select-portal')) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateCoords = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          left: rect.left,
          top: rect.bottom + window.scrollY,
          width: rect.width
        });
      }
    };
    updateCoords();
    if (isOpen) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (!selected.includes(option)) {
      onChange([...selected, option]);
    }
    setIsOpen(false);
  };

  const handleRemove = (option) => {
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', minWidth: '150px' }}>
      <div 
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.35rem', padding: '0.35rem',
          border: '1px solid #D1D5DB', borderRadius: '0.375rem', minHeight: '38px',
          alignItems: 'center', backgroundColor: '#FFF', cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && <span style={{ color: '#9CA3AF', fontSize: '0.875rem', paddingLeft: '0.25rem' }}>{placeholder}</span>}
        {selected.map(sel => (
          <span key={sel} style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            backgroundColor: '#E0E7FF', color: '#3730A3', padding: '0.15rem 0.4rem',
            borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500'
          }}>
            {sel}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemove(sel); }}
              style={{ border: 'none', background: 'transparent', color: '#4F46E5', cursor: 'pointer', fontSize: '0.875rem', lineHeight: 1, padding: 0 }}
            >×</button>
          </span>
        ))}
      </div>
      
      {isOpen && coords && createPortal(
        <div className="multi-select-portal" style={{
          position: 'absolute', top: coords.top + 4, left: coords.left, width: coords.width, zIndex: 9999,
          backgroundColor: '#FFF', border: '1px solid #D1D5DB',
          borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px', overflowY: 'auto'
        }}>
          {options.filter(opt => !selected.includes(opt)).map(opt => (
            <div 
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {opt}
            </div>
          ))}
          {options.filter(opt => !selected.includes(opt)).length === 0 && (
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#9CA3AF', textAlign: 'center' }}>No options left</div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
const TABS = [
  { id: 'STUDENT', label: 'Students' },
  { id: 'SPC', label: 'SPCs' },
  { id: 'FPC', label: 'FPCs' }
];

const UsersTable = ({ currentUser }) => {
  const visibleTabs = currentUser?.role === 'FPC' ? TABS.filter(t => t.id !== 'FPC') : TABS;
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('STUDENT');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roleEdits, setRoleEdits] = useState({});
  const [updatingRole, setUpdatingRole] = useState({});
  
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [fpcInputs, setFpcInputs] = useState([{ email: '', department_branches: ['CSE'] }]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  
  const [deletingUser, setDeletingUser] = useState({});

  const [editingFpcId, setEditingFpcId] = useState(null);
  const [fpcEditDepts, setFpcEditDepts] = useState([]);
  const [savingFpcId, setSavingFpcId] = useState(null);

  const limit = paginationConfig.DEFAULT_LIMIT;

  const fetchUsers = () => {
    setLoading(true);
    apiClient.get(`/admin/users?role=${activeTab}&page=${page}&limit=${limit}`)
      .then(res => {
        setUsers(res.data?.data?.users || []);
        setTotalPages(res.data?.data?.pagination?.totalPages || 1);
        setRoleEdits({});
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [activeTab, page]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1); // reset to page 1 on tab switch
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handleRoleSelect = (userId, newRole) => {
    setRoleEdits(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleApplyRole = (userId) => {
    const newRole = roleEdits[userId];
    if (!newRole) return;
    setUpdatingRole(prev => ({ ...prev, [userId]: true }));

    apiClient.patch(`/admin/users/${userId}/role`, { role: newRole })
      .then(() => {
        fetchUsers();
      })
      .catch(() => alert('Failed to update role.'))
      .finally(() => {
        setUpdatingRole(prev => ({ ...prev, [userId]: false }));
      });
  };

  const handleBulkAdd = () => {
    const validInputs = fpcInputs.filter(f => f.email.trim() && f.department_branches.length > 0);
    if (validInputs.length === 0) return;

    setSubmittingBulk(true);
    apiClient.post('/admin/users/bulk-fpcs', { fpcs: validInputs })
      .then(res => {
        alert(`Successfully added ${res.data?.data?.successful?.length || 0} FPCs.`);
        setFpcInputs([{ email: '', department_branches: ['CSE'] }]);
        setShowBulkAdd(false);
        fetchUsers();
      })
      .catch(() => alert('Failed to create FPCs.'))
      .finally(() => setSubmittingBulk(false));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    
    setDeletingUser(prev => ({ ...prev, [userId]: true }));
    apiClient.delete(`/admin/users/${userId}`)
      .then(() => fetchUsers())
      .catch(() => alert('Failed to delete user.'))
      .finally(() => setDeletingUser(prev => ({ ...prev, [userId]: false })));
  };

  const handleSaveFpcDepartments = (userId) => {
    if (fpcEditDepts.length === 0) {
      alert("Please select at least one department");
      return;
    }
    setSavingFpcId(userId);
    apiClient.patch(`/admin/users/${userId}/fpc-departments`, { department_branches: fpcEditDepts })
      .then(() => {
        setEditingFpcId(null);
        fetchUsers();
      })
      .catch(() => alert('Failed to update FPC departments.'))
      .finally(() => setSavingFpcId(null));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        padding: '0 1rem'
      }}>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#6B7280',
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Add UI (Only visible on FPC Tab) */}
      {activeTab === 'FPC' && (
        <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <button
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#10B981', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            {showBulkAdd ? '- Cancel FPC Creation' : '+ Add FPC(s)'}
          </button>
          
          {showBulkAdd && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '600px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Enter FPC Details:
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {fpcInputs.map((input, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <input 
                      type="email"
                      value={input.email}
                      onChange={(e) => {
                          const newInputs = [...fpcInputs];
                          newInputs[idx].email = e.target.value;
                          setFpcInputs(newInputs);
                      }}
                      placeholder={`fpc${idx+1}@sjbit.edu.in`}
                      style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', flex: 1 }}
                    />
                    <div style={{ flex: '0 0 250px' }}>
                      <MultiSelectDropdown
                        options={DEPARTMENT_OPTIONS}
                        selected={input.department_branches}
                        onChange={(selected) => {
                          const newInputs = [...fpcInputs];
                          newInputs[idx].department_branches = selected;
                          setFpcInputs(newInputs);
                        }}
                        placeholder="Select branches..."
                      />
                    </div>
                    {fpcInputs.length > 1 && (
                      <button 
                         onClick={() => setFpcInputs(fpcInputs.filter((_, i) => i !== idx))}
                         style={{ padding: '0.5rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.2rem' }}>
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setFpcInputs([...fpcInputs, { email: '', department_branches: ['CSE'] }])}
                style={{ padding: '0.35rem 0.5rem', alignSelf: 'flex-start', background: 'none', border: '1px dashed #D1D5DB', borderRadius: '0.375rem', cursor: 'pointer', color: '#6B7280', fontSize: '0.85rem' }}
              >
                 + Add Another Row
              </button>

              <button
                onClick={handleBulkAdd}
                disabled={submittingBulk || fpcInputs.filter(f => f.email.trim()).length === 0}
                style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', width: 'fit-content', backgroundColor: '#2563EB', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: (submittingBulk || fpcInputs.filter(f => f.email.trim()).length === 0) ? 'not-allowed' : 'pointer', fontWeight: '500' }}
              >
                {submittingBulk ? 'Adding...' : 'Submit FPCs'}
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                {['#', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(col => (
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                    No users found for this role.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.875rem 1.5rem', color: '#9CA3AF' }}>{(page - 1) * limit + idx + 1}</td>
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
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {u.role === 'FPC' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                             {editingFpcId === u.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   <div style={{ width: '250px' }}>
                                      <MultiSelectDropdown 
                                        options={DEPARTMENT_OPTIONS} 
                                        selected={fpcEditDepts} 
                                        onChange={setFpcEditDepts} 
                                        placeholder="Add department..." 
                                      />
                                   </div>
                                   <button 
                                      onClick={() => handleSaveFpcDepartments(u.id)}
                                      disabled={savingFpcId === u.id}
                                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500' }}
                                   >{savingFpcId === u.id ? 'Saving...' : 'Save'}</button>
                                   <button 
                                      onClick={() => setEditingFpcId(null)}
                                      style={{ padding: '0.35rem 0.75rem', backgroundColor: '#6B7280', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500' }}
                                   >Cancel</button>
                                </div>
                             ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', maxWidth: '200px' }}>
                                     {u.department_branches && u.department_branches.length > 0 ? 
                                       u.department_branches.map(b => (
                                         <span key={b} style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{b}</span>
                                       )) : <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>No Depts</span>
                                     }
                                   </div>
                                   <button
                                     onClick={() => { setEditingFpcId(u.id); setFpcEditDepts(u.department_branches || []); }}
                                     style={{ padding: '0.35rem 0.75rem', backgroundColor: '#E5E7EB', color: '#374151', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }}
                                   >Edit Depts</button>
                                   <button
                                     onClick={() => handleDeleteUser(u.id)}
                                     disabled={deletingUser[u.id]}
                                     style={{
                                       padding: '0.35rem 0.75rem',
                                       backgroundColor: '#EF4444',
                                       color: 'white',
                                       border: 'none',
                                       borderRadius: '0.375rem',
                                       cursor: deletingUser[u.id] ? 'wait' : 'pointer',
                                       fontSize: '0.75rem',
                                       fontWeight: '500'
                                     }}
                                   >
                                     {deletingUser[u.id] ? 'Deleting...' : 'Delete FPC'}
                                   </button>
                                </div>
                             )}
                          </div>
                        ) : (
                          <>
                            <select
                              value={roleEdits[u.id] || u.role}
                              onChange={(e) => handleRoleSelect(u.id, e.target.value)}
                              style={{ padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#374151' }}
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="SPC">SPC</option>
                            </select>
                            {roleEdits[u.id] && roleEdits[u.id] !== u.role && (
                              <button
                                onClick={() => handleApplyRole(u.id)}
                                disabled={updatingRole[u.id]}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  backgroundColor: '#2563EB',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  cursor: updatingRole[u.id] ? 'wait' : 'pointer',
                                  fontWeight: '500'
                                }}
                              >
                                {updatingRole[u.id] ? 'Saving...' : 'Apply'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              <div>
                Page <b>{page}</b> of <b>{totalPages}</b>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #D1D5DB',
                    backgroundColor: page === 1 ? '#F3F4F6' : '#FFFFFF',
                    color: page === 1 ? '#9CA3AF' : '#374151',
                    borderRadius: '0.375rem',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #D1D5DB',
                    backgroundColor: page === totalPages ? '#F3F4F6' : '#FFFFFF',
                    color: page === totalPages ? '#9CA3AF' : '#374151',
                    borderRadius: '0.375rem',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersTable;
