import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const HistoryChart = ({ data }) => {
  return (
    <div className="modern-card chart-card">
      <div className="panel-header">
        <div>
          <p className="panel-label">Analytics</p>
          <h3>Dual Sensor Flow History</h3>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [`${Number(value).toFixed(2)} L/min`, name]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sensor1FlowRate"
              name="Sensor 1"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sensor2FlowRate"
              name="Sensor 2"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="flowDifference"
              name="Difference"
              stroke="#dc2626"
              strokeWidth={3}
              dot={false}
              strokeDasharray="6 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;