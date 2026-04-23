import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/apiClient';
import Sidebar from './components/Sidebar';
import DynamicForm from '../../../components/ui/DynamicForm';
import DashboardHeader from './components/DashboardHeader';
import SubTabNav from './components/SubTabNav';
import dashboardConfig from './config/dashboardConfig.json';
import Approvals from '../admin/components/Approvals';

const StudentDashboard = ({ user, onLogout }) => {
  const [contextData, setContextData] = useState({});

  const tabs = React.useMemo(() => {
    const baseTabs = [...dashboardConfig.tabs];
    if (user.role === 'SPC') {
      baseTabs.push({ id: 'Approvals', label: 'Approvals', isCustomComponent: true });
    }
    return baseTabs;
  }, [user.role]);

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);
  const [activeSubTabId, setActiveSubTabId] = useState('');
  const [subTabStatuses, setSubTabStatuses] = useState(() => {
    const initial = {};
    tabs.forEach(tab => tab.subTabs?.forEach(sub => { initial[sub.id] = 'INCOMPLETE'; }));
    return initial;
  });

  useEffect(() => {
    apiClient.get('/student/statuses')
      .then(res => { if (res.data?.statuses) setSubTabStatuses(prev => ({ ...prev, ...res.data.statuses })); })
      .catch(err => console.error("Failed to load statuses", err));
  }, []);

  // Reset subtab when active main tab changes
  useEffect(() => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.subTabs?.length > 0) setActiveSubTabId(tab.subTabs[0].id);
  }, [activeTabId, tabs]);

  // Load context dependencies for conditional subtab visibility
  useEffect(() => {
    const seen = new Set();
    const dependencies = [];
    tabs.forEach(tab =>
      tab.subTabs?.forEach(sub => {
        if (sub.dependsOn && !seen.has(sub.dependsOn.endpoint)) {
          seen.add(sub.dependsOn.endpoint);
          dependencies.push(sub.dependsOn);
        }
      })
    );
    dependencies.forEach(async (dep) => {
      try {
        const res = await apiClient.get(dep.endpoint);
        setContextData(prev => ({ ...prev, [dep.context]: res.data?.data }));
      } catch (err) {
        console.error("Failed to load dependency context", err);
      }
    });
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const visibleSubTabs = activeTab?.subTabs?.filter(subTab => {
    if (!subTab.dependsOn) return true;
    const { context, field, value } = subTab.dependsOn;
    return contextData[context]?.[field] === value;
  }) || [];

  const activeSubTab = visibleSubTabs.find(st => st.id === activeSubTabId) || visibleSubTabs[0];
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
        <DashboardHeader
          title={activeTab?.label}
          subtitle={`View and manage your ${activeTab?.label?.toLowerCase()} information.`}
          user={user}
          onLogout={onLogout}
        />

        <div style={{ padding: '2rem' }}>
          {activeTabId === 'Approvals' ? (
             <div style={{ backgroundColor: '#FFFFFF', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <Approvals />
             </div>
          ) : (
            <div style={{ display: isVertical ? 'flex' : 'block', gap: '2rem', alignItems: 'flex-start' }}>
              <SubTabNav
                visibleSubTabs={visibleSubTabs}
                activeSubTabId={activeSubTabId}
                onSubTabSelect={setActiveSubTabId}
                subTabStatuses={subTabStatuses}
                isVertical={isVertical}
              />

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
                    onStatusChange={(status) => setSubTabStatuses(prev => ({ ...prev, [activeSubTab.id]: status }))}
                    key={activeSubTab.id}
                  />
                ) : (
                  <p>Select a section to view details.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
