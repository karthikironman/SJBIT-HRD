import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Sidebar from '../components/Sidebar';
import DynamicForm from '../components/DynamicForm';
import dashboardConfig from '../config/dashboardConfig.json';

const Dashboard = () => {
  const navigate = useNavigate();
  // ProtectedRoute ensures that user is authenticated and data exists in localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [dynamicOverrides, setDynamicOverrides] = useState({});
  const [contextData, setContextData] = useState({});

  const tabs = React.useMemo(() => {
    return dashboardConfig.tabs.map(tab => {
      if (dynamicOverrides[tab.id]) {
        return { ...tab, subTabs: dynamicOverrides[tab.id] };
      }
      return tab;
    });
  }, [dynamicOverrides]);

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
  const [activeSubTabId, setActiveSubTabId] = useState('');
  
  // Lifted state to track the status of all subtabs simultaneously.
  const [subTabStatuses, setSubTabStatuses] = useState(() => {
    const initial = {};
    tabs.forEach(tab => {
      tab.subTabs?.forEach(sub => {
        initial[sub.id] = 'INCOMPLETE'; // Default fallback until backend feeds actuals
      });
    });
    return initial;
  });

  // Fetch true statuses on mount, along with any dynamically generated tabs!
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await apiClient.get('/student/statuses');
        if (res.data?.statuses) {
          setSubTabStatuses(prev => ({ ...prev, ...res.data.statuses }));
        }
      } catch (err) {
        console.error("Failed to load statuses", err);
      }
    };

    const fetchDynamics = async () => {
      const overrides = {};
      for (const tab of dashboardConfig.tabs) {
        if (tab.dynamicSubTabs) {
          try {
            const res = await apiClient.get(tab.dynamicSubTabs.fetchListEndpoint);
            if (res.data?.data) {
              overrides[tab.id] = res.data.data.map((item, index) => ({
                id: item.id,
                label: `${tab.dynamicSubTabs.template.labelPrefix}${item.company_name || `Offer #${index + 1}`}`,
                fetchEndpoint: tab.dynamicSubTabs.template.fetchEndpoint.replace(':id', item.id),
                saveEndpoint: tab.dynamicSubTabs.template.saveEndpoint.replace(':id', item.id),
                fields: tab.dynamicSubTabs.template.fields
               }));
            }
          } catch (e) {
            console.error("Failed to load dynamic tabs for", tab.id);
          }
        }
      }
      if (Object.keys(overrides).length > 0) {
        setDynamicOverrides(overrides);
      }
    };

    fetchStatuses();
    fetchDynamics();
  }, []);

  // When activeTabId changes, reset the subTab to the first visible one in the new tab
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.subTabs && tab.subTabs.length > 0) {
      setActiveSubTabId(tab.subTabs[0].id);
    }
  }, [activeTabId, tabs]);

  // Fetch contextual dependencies defined in the config (e.g. core-info for dynamic tabs)
  useEffect(() => {
    const dependencies = [];
    tabs.forEach(tab => {
        tab.subTabs?.forEach(sub => {
            if (sub.dependsOn && !dependencies.some(d => d.endpoint === sub.dependsOn.endpoint)) {
                dependencies.push(sub.dependsOn);
            }
        });
    });

    dependencies.forEach(async (dep) => {
        try {
            const res = await apiClient.get(dep.endpoint);
            setContextData(prev => ({ ...prev, [dep.context]: res.data?.data }));
        } catch (err) {
            console.error("Failed to load dependency context", err);
        }
    });
  }, [tabs]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user || Object.keys(user).length === 0) return null;

  if (['FPC', 'ADMIN', 'SUPER_USER'].includes(user.role)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '0.5rem' }}>{user.role} Portal</h1>
        <p style={{ color: '#4B5563', marginBottom: '2rem', fontSize: '1.1rem' }}>Your dedicated dashboard module is currently under construction.</p>
        <button 
          onClick={handleLogout} 
          style={{
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          Secure Logout
        </button>
      </div>
    );
  }

  const activeTab = tabs.find(t => t.id === activeTabId);
  const visibleSubTabs = activeTab?.subTabs?.filter(subTab => {
    if (!subTab.dependsOn) return true;
    const { context, field, value } = subTab.dependsOn;
    if (!contextData[context]) return false; // Hide until loaded or if missing
    return contextData[context][field] === value;
  }) || [];

  const activeSubTab = visibleSubTabs.find(st => st.id === activeSubTabId) || visibleSubTabs[0];

  const STATUS_META = {
    'INCOMPLETE': { color: '#F59E0B', label: 'Incomplete' },
    'REJECTED': { color: '#EF4444', label: 'Rejected' },
    'PENDING': { color: '#3B82F6', label: 'Pending' },
    'APPROVED': { color: '#10B981', label: 'Verified' }
  };

  const handleStatusChange = (subTabId, newStatus) => {
    setSubTabStatuses(prev => ({ ...prev, [subTabId]: newStatus }));
  };

  const isVertical = activeTab?.subTabOrientation === 'vertical';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <Sidebar 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onTabSelect={setActiveTabId} 
        subTabStatuses={subTabStatuses}
        contextData={contextData}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: '1rem 2rem', 
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>{activeTab?.label}</h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.875rem' }}>View and manage your {activeTab?.label.toLowerCase()} information.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>Logged in as <b>{user.email}</b> ({user.role})</span>
            <button 
              onClick={handleLogout} 
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: isVertical ? 'flex' : 'block', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* SubTab Navigation */}
            {(visibleSubTabs.length > 0 || activeTab?.dynamicSubTabs) && (
              <div style={{ 
                display: 'flex', 
                flexDirection: isVertical ? 'column' : 'row',
                gap: '0.5rem', 
                marginBottom: isVertical ? 0 : '2rem',
                borderBottom: isVertical ? 'none' : '1px solid #D1D5DB',
                borderRight: isVertical ? '1px solid #D1D5DB' : 'none',
                paddingBottom: isVertical ? 0 : '1px',
                paddingRight: isVertical ? '1.5rem' : 0,
                minWidth: isVertical ? '220px' : 'auto',
                flexShrink: 0
              }}>
                {visibleSubTabs.map(subTab => {
                  const sTabStatus = subTabStatuses[subTab.id] || 'INCOMPLETE';
                  const meta = STATUS_META[sTabStatus];
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveSubTabId(subTab.id)}
                      style={{
                        backgroundColor: activeSubTabId === subTab.id && isVertical ? '#EFF6FF' : 'transparent',
                        border: 'none',
                        borderBottom: !isVertical && activeSubTabId === subTab.id ? '2px solid #3B82F6' : (!isVertical ? '2px solid transparent' : 'none'),
                        borderLeft: isVertical && activeSubTabId === subTab.id ? '3px solid #3B82F6' : (isVertical ? '3px solid transparent' : 'none'),
                        color: activeSubTabId === subTab.id ? '#2563EB' : '#4B5563',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        fontWeight: activeSubTabId === subTab.id ? 'bold' : 'normal',
                        marginBottom: isVertical ? 0 : '-1px',
                        marginLeft: isVertical ? '-1px' : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        textAlign: 'left',
                        borderRadius: isVertical ? '0.375rem' : 0
                      }}
                    >
                      <span style={{ flex: 1 }}>{subTab.label}</span>
                      <span style={{
                        fontSize: '0.65rem',
                        backgroundColor: meta.color,
                        color: 'white',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {sTabStatus === 'APPROVED' ? 'OK' : sTabStatus.substring(0, 3)}
                      </span>
                    </button>
                  );
                })}

                {/* Dynamic Creation Button Injection */}
                {activeTab.dynamicSubTabs && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await apiClient.post(activeTab.dynamicSubTabs.createEndpoint, {});
                        const newItem = res.data?.data;
                        if (newItem) {
                          const newSubTab = {
                            id: newItem.id,
                            label: `${activeTab.dynamicSubTabs.template.labelPrefix}${newItem.company_name || 'New Item'}`,
                            fetchEndpoint: activeTab.dynamicSubTabs.template.fetchEndpoint.replace(':id', newItem.id),
                            saveEndpoint: activeTab.dynamicSubTabs.template.saveEndpoint.replace(':id', newItem.id),
                            fields: activeTab.dynamicSubTabs.template.fields
                          };
                          setDynamicOverrides(prev => ({
                            ...prev,
                            [activeTab.id]: [...(prev[activeTab.id] || []), newSubTab]
                          }));
                          setActiveSubTabId(newItem.id);
                        }
                      } catch (e) {
                        console.error("Failed to generate dynamic tab", e);
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: isVertical ? '1px dashed #9CA3AF' : 'none',
                      color: '#4B5563',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textAlign: isVertical ? 'center' : 'left',
                      borderRadius: isVertical ? '0.375rem' : 0,
                      marginTop: isVertical ? '0.5rem' : 0,
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    ➕ Add New Offer
                  </button>
                )}
              </div>
            )}

            {/* Form Container */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: '2rem', 
              borderRadius: '0.5rem', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              flex: 1,
              width: '100%'
            }}>
              {activeSubTab ? (
                <DynamicForm 
                  config={activeSubTab} 
                  onStatusChange={(status) => handleStatusChange(activeSubTab.id, status)} 
                  key={activeSubTab.id}
                />
              ) : (
                <p>Select a section to view details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
