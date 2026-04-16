const StatusBanner = ({ status, remarks }) => {
  if (!status) return null;

  const styleMap = {
    'INCOMPLETE': { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '⚠️', title: 'Incomplete Entry' },
    'PENDING': { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: '⏳', title: 'Pending Verification' },
    'REJECTED': { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C', icon: '❌', title: 'Rejected' },
    'APPROVED': { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: '✅', title: 'Verified' },
  };

  // Default to pending if unknown
  const config = styleMap[status.toUpperCase()] || styleMap['PENDING'];

  return (
    <div
      style={{
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`,
        padding: '1rem',
        borderRadius: '0.375rem',
        marginBottom: '1.5rem',
        color: config.text
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        <span style={{ marginRight: '0.5rem' }}>{config.icon}</span>
        {config.title}
      </div>
      <div>
        {status.toUpperCase() === 'INCOMPLETE' && "Status is Incomplete. Please fill all required fields and submit."}
        {status.toUpperCase() === 'PENDING' && "Your submission is pending review. Please wait."}
        {status.toUpperCase() === 'REJECTED' && (
          <div>
            Your submission was rejected. Please review remarks and apply for verification again.
            {remarks && <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Remarks: {remarks}</div>}
          </div>
        )}
        {status.toUpperCase() === 'APPROVED' && "This information has been verified and locked."}
      </div>
    </div>
  );
};

export default StatusBanner;
