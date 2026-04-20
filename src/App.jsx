import { useEffect, useMemo, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from './firebase';

import StatCard from './components/StatCard';
import StatusBadge from './components/StatusBadge';
import LeakAlertCard from './components/LeakAlertCard';
import HistoryChart from './components/HistoryChart';
import Footer from './components/Footer';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'assets/css/styles.css';
import { formatTimestamp } from './utils/formatDate';

const DEVICE_ID = 'esp32-001';

function App() {
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [lastSeen, setLastSeen] = useState('');
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  const [sensorReadings, setSensorReadings] = useState({
    flowRate: 0,
    totalVolume: 0,
    timestamp: '',
    deviceId: DEVICE_ID,
  });

  const [dualSensorReadings, setDualSensorReadings] = useState({
    sensor1: {
      flowRate: 0,
      totalVolume: 0,
    },
    sensor2: {
      flowRate: 0,
      totalVolume: 0,
    },
    flowDifference: 0,
    timestamp: '',
    deviceId: DEVICE_ID,
  });

  const [leakAlert, setLeakAlert] = useState({
    status: 'clear',
    flowRate: 0,
    detectedAt: '',
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!rtdb) {
      console.error('Realtime Database is not initialized.');
      return;
    }

    console.log('Attaching Firebase Realtime listeners...');

    const connectedRef = ref(rtdb, '.info/connected');
    const statusRef = ref(rtdb, `devices/${DEVICE_ID}/status`);
    const lastSeenRef = ref(rtdb, `devices/${DEVICE_ID}/lastSeen`);
    const readingsRef = ref(rtdb, 'sensorReadings');
    const dualReadingsRef = ref(rtdb, 'dualSensorReadings');
    const leakRef = ref(rtdb, 'leakAlert');
    const historyRef = ref(rtdb, 'sensorHistory');

    const unsubConnected = onValue(
      connectedRef,
      (snapshot) => {
        setFirebaseConnected(snapshot.val() === true);
      },
      (error) => {
        console.error('Connected listener error:', error);
      }
    );

    const unsubStatus = onValue(
      statusRef,
      (snapshot) => {
        setDeviceStatus(snapshot.val() || 'offline');
      },
      (error) => {
        console.error('Status listener error:', error);
      }
    );

    const unsubLastSeen = onValue(
      lastSeenRef,
      (snapshot) => {
        setLastSeen(snapshot.val() || '');
      },
      (error) => {
        console.error('LastSeen listener error:', error);
      }
    );

    const unsubReadings = onValue(
      readingsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setSensorReadings({
            flowRate: 0,
            totalVolume: 0,
            timestamp: '',
            deviceId: DEVICE_ID,
          });
          return;
        }

        setSensorReadings({
          flowRate: Number(data.flowRate || 0),
          totalVolume: Number(data.totalVolume || 0),
          timestamp: data.timestamp || '',
          deviceId: data.deviceId || DEVICE_ID,
        });
      },
      (error) => {
        console.error('sensorReadings listener error:', error);
      }
    );

    const unsubDualReadings = onValue(
      dualReadingsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setDualSensorReadings({
            sensor1: { flowRate: 0, totalVolume: 0 },
            sensor2: { flowRate: 0, totalVolume: 0 },
            flowDifference: 0,
            timestamp: '',
            deviceId: DEVICE_ID,
          });
          return;
        }

        setDualSensorReadings({
          sensor1: {
            flowRate: Number(data?.sensor1?.flowRate || 0),
            totalVolume: Number(data?.sensor1?.totalVolume || 0),
          },
          sensor2: {
            flowRate: Number(data?.sensor2?.flowRate || 0),
            totalVolume: Number(data?.sensor2?.totalVolume || 0),
          },
          flowDifference: Number(data?.flowDifference || 0),
          timestamp: data?.timestamp || '',
          deviceId: data?.deviceId || DEVICE_ID,
        });
      },
      (error) => {
        console.error('dualSensorReadings listener error:', error);
      }
    );

    const unsubLeak = onValue(
      leakRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setLeakAlert({
            status: 'clear',
            flowRate: 0,
            detectedAt: '',
          });
          return;
        }

        setLeakAlert({
          status: data.status || 'clear',
          flowRate: Number(data.flowRate || 0),
          detectedAt: data.detectedAt || '',
        });
      },
      (error) => {
        console.error('leakAlert listener error:', error);
      }
    );

    const unsubHistory = onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setHistory([]);
          return;
        }

        const arr = Object.entries(data)
          .map(([key, value]) => ({
            key,
            flowRate: Number(value?.flowRate || 0),
            sensor1FlowRate: Number(value?.sensor1FlowRate || 0),
            sensor2FlowRate: Number(value?.sensor2FlowRate || 0),
            flowDifference: Number(value?.flowDifference || 0),
            time: value?.time || '',
          }))
          .sort((a, b) => Number(a.key) - Number(b.key))
          .slice(-20)
          .map((item) => ({
            ...item,
            label: item.time ? item.time.slice(11, 19) : item.key,
          }));

        setHistory(arr);
      },
      (error) => {
        console.error('sensorHistory listener error:', error);
      }
    );

    return () => {
      unsubConnected();
      unsubStatus();
      unsubLastSeen();
      unsubReadings();
      unsubDualReadings();
      unsubLeak();
      unsubHistory();
    };
  }, []);

  const leakIsActive = useMemo(() => leakAlert.status === 'active', [leakAlert.status]);

  return (
    <div className="app-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <header className="hero-card">
        <div>
          <p className="eyebrow">Smart Monitoring System</p>
          <h1>Water Usage Monitoring Dashboard</h1>
          <p className="hero-subtext">
            Real-time dual-sensor water flow tracking, leak detection, and device monitoring.
          </p>
        </div>

        <div className="hero-right">
          <div className="hero-status">
            <span className="hero-label">Device Status</span>
            <StatusBadge status={deviceStatus} />
            <small style={{ opacity: 0.8 }}>
              Firebase: {firebaseConnected ? 'Connected' : 'Disconnected'}
            </small>
          </div>
        </div>
      </header>

      <section className="stats-grid stats-grid--six">
        <StatCard
          title="Average Flow Rate"
          value={`${sensorReadings.flowRate.toFixed(2)} L/min`}
          subtitle={`Updated: ${formatTimestamp(sensorReadings.timestamp) || '—'}`}
        />

        <StatCard
          title="Combined Total Volume"
          value={`${sensorReadings.totalVolume.toFixed(3)} L`}
          subtitle={`Device ID: ${sensorReadings.deviceId}`}
        />

        <StatCard
          title="Sensor 1 Flow"
          value={`${dualSensorReadings.sensor1.flowRate.toFixed(2)} L/min`}
          subtitle={`Total: ${dualSensorReadings.sensor1.totalVolume.toFixed(3)} L`}
        />

        <StatCard
          title="Sensor 2 Flow"
          value={`${dualSensorReadings.sensor2.flowRate.toFixed(2)} L/min`}
          subtitle={`Total: ${dualSensorReadings.sensor2.totalVolume.toFixed(3)} L`}
        />

        <StatCard
          title="Flow Difference"
          value={`${dualSensorReadings.flowDifference.toFixed(2)} L/min`}
          subtitle={
            dualSensorReadings.flowDifference > 1.5
              ? 'Possible water loss detected'
              : 'Difference is within normal range'
          }
        />

        <StatCard
          title="Last Seen"
          value={formatTimestamp(lastSeen) || '—'}
          subtitle="Latest heartbeat from ESP32"
        />
      </section>

      <section className="system-state-row">
        <div className={`system-state-card ${leakIsActive ? 'danger' : 'safe'}`}>
          <div>
            <p className="system-state-label">System State</p>
            <h3>{leakIsActive ? 'Leak Detected' : 'Normal Operation'}</h3>
            <p className="system-state-text">
              {leakIsActive
                ? 'Immediate attention required. Flow mismatch or abnormal condition detected.'
                : 'Flow condition is currently stable across monitored sensors.'}
            </p>
          </div>

          <div className={`system-state-badge ${leakIsActive ? 'danger' : 'safe'}`}>
            {leakIsActive ? 'ALERT ACTIVE' : 'SYSTEM NORMAL'}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="main-panel">
          <HistoryChart data={history} />
        </div>

        <div className="side-panel">
          <LeakAlertCard leakAlert={leakAlert} />
        </div>
      </section>

      <hr className="mt-5" />
      <Footer />
    </div>
  );
}

export default App;