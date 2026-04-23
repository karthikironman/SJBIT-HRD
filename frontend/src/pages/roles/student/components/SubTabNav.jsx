import React from 'react';

const STATUS_META = {
  'INCOMPLETE': { color: '#F59E0B' },
  'REJECTED':   { color: '#EF4444' },
  'PENDING':    { color: '#3B82F6' },
  'APPROVED':   { color: '#10B981' },
};

const SubTabNav = ({ visibleSubTabs, activeSubTabId, onSubTabSelect, subTabStatuses, isVertical }) => {
  if (!visibleSubTabs.length) return null;

  return (
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
      flexShrink: 0,
    }}>
      {visibleSubTabs.map(subTab => {
        const sTabStatus = subTabStatuses[subTab.id] || 'INCOMPLETE';
        const meta = STATUS_META[sTabStatus];
        const isActive = activeSubTabId === subTab.id;
        return (
          <button
            key={subTab.id}
            onClick={() => onSubTabSelect(subTab.id)}
            style={{
              backgroundColor: isActive && isVertical ? '#EFF6FF' : 'transparent',
              border: 'none',
              borderBottom: !isVertical ? (isActive ? '2px solid #3B82F6' : '2px solid transparent') : 'none',
              borderLeft: isVertical ? (isActive ? '3px solid #3B82F6' : '3px solid transparent') : 'none',
              color: isActive ? '#2563EB' : '#4B5563',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              fontWeight: isActive ? 'bold' : 'normal',
              marginBottom: isVertical ? 0 : '-1px',
              marginLeft: isVertical ? '-1px' : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              textAlign: 'left',
              borderRadius: isVertical ? '0.375rem' : 0,
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
              textTransform: 'uppercase',
            }}>
              {sTabStatus === 'APPROVED' ? 'OK' : sTabStatus.substring(0, 3)}
            </span>
          </button>
        );
      })}

    </div>
  );
};

export default SubTabNav;
