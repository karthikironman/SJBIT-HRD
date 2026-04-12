import React from 'react';

const STATUS_ICONS = {
  'INCOMPLETE': { icon: '⚠️', color: '#F59E0B' },
  'REJECTED': { icon: '❌', color: '#EF4444' },
  'PENDING': { icon: '⏳', color: '#3B82F6' },
  'APPROVED': { icon: '✅', color: '#10B981' }
};

const Sidebar = ({ tabs, activeTabId, onTabSelect, subTabStatuses = {}, contextData = {} }) => {
  const isSubTabVisible = (subTab) => {
    if (!subTab.dependsOn) return true;
    const { context, field, value } = subTab.dependsOn;
    if (!contextData[context]) return false;
    return contextData[context][field] === value;
  };

  const getAggregatedStatus = (tab) => {
    if (!tab.subTabs || tab.subTabs.length === 0) return 'INCOMPLETE';

    const visibleSubTabs = tab.subTabs.filter(isSubTabVisible);
    if (visibleSubTabs.length === 0) return 'INCOMPLETE';

    let hasPending = false;

    for (const sub of visibleSubTabs) {
      const status = subTabStatuses[sub.id] || 'INCOMPLETE';
      if (status === 'INCOMPLETE') return 'INCOMPLETE';
      if (status === 'REJECTED') return 'REJECTED';
      if (status === 'PENDING') hasPending = true;
    }

    if (hasPending) return 'PENDING';
    return 'APPROVED';
  };
  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1F2937',
      color: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 'calc(100vh - 64px)' // Assuming a top nav might exist, else 100vh
    }}>
      <div style={{ padding: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', borderBottom: '1px solid #374151' }}>
        {import.meta.env.VITE_BRAND_NAME || 'Student'} Portal
      </div>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tabs.map(tab => {
            const aggStatus = getAggregatedStatus(tab);
            const statusMeta = STATUS_ICONS[aggStatus];

            return (
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
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{tab.label}</span>
                  <span title={aggStatus} style={{ fontSize: '0.8rem' }}>
                    {statusMeta.icon}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
