import { formatTimestamp } from "../utils/formatDate";

const LeakAlertCard = ({ leakAlert, dualSensorReadings }) => {
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
          <span>Flow Difference</span>
          <strong>
            {Number(dualSensorReadings?.flowDifference || leakAlert?.flowRate || 0).toFixed(2)} L/min
          </strong>
        </div>

        <div className="alert-metric">
          <span>Sensor 1 Flow</span>
          <strong>
            {Number(dualSensorReadings?.sensor1?.flowRate || 0).toFixed(2)} L/min
          </strong>
        </div>

        <div className="alert-metric">
          <span>Sensor 2 Flow</span>
          <strong>
            {Number(dualSensorReadings?.sensor2?.flowRate || 0).toFixed(2)} L/min
          </strong>
        </div>

        <div className="alert-metric">
          <span>Detected At</span>
          <strong>{formatTimestamp(leakAlert?.detectedAt) || '—'}</strong>
        </div>

        <div className="alert-metric">
          <span>Assessment</span>
          <strong>
            {active
              ? 'Possible water loss or abnormal flow mismatch detected'
              : 'No abnormal leak condition detected'}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default LeakAlertCard;