import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  const HistoryChart = ({ data }) => {
    return (
      <div className="modern-card chart-card">
        <div className="panel-header">
          <div>
            <p className="panel-label">Analytics</p>
            <h3>Flow Rate History</h3>
          </div>
        </div>
  
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="flowRate" stroke="#2563eb" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  export default HistoryChart;