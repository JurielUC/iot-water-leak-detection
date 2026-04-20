import { formatTimestamp } from "../utils/formatDate";

const LeakAlertCard = ({ leakAlert }) => {
    const active = leakAlert?.status === 'active';
  
    return (
      <div className={`modern-card leak-card ${active ? 'active' : 'clear'}`}>
        <div className="panel-header">
          <div>
            <p className="panel-label">Alert Monitor</p>
            <h3>Leak Alert</h3>
          </div>
          <span className={`alert-pill ${active ? 'danger' : 'safe'}`}>
            {active ? 'ACTIVE' : 'CLEAR'}
          </span>
        </div>
  
        <div className="alert-body">
          <div className="alert-metric">
            <span>Flow Rate</span>
            <strong>{Number(leakAlert?.flowRate || 0).toFixed(2)} L/min</strong>
          </div>
  
          <div className="alert-metric">
            <span>Detected At</span>
            <strong>{formatTimestamp(leakAlert?.detectedAt) || '—'}</strong>
          </div>
        </div>
      </div>
    );
  };
  
  export default LeakAlertCard;