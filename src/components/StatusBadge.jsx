const StatusBadge = ({ status }) => {
    const normalized = String(status || 'offline').toLowerCase();
  
    return (
      <span className={`status-badge ${normalized === 'online' ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        {normalized}
      </span>
    );
  };
  
  export default StatusBadge;