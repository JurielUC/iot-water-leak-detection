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
  const [sensorReadings, setSensorReadings] = useState({
    flowRate: 0,
    totalVolume: 0,
    timestamp: '',
    deviceId: DEVICE_ID,
  });
  const [leakAlert, setLeakAlert] = useState({
    status: 'clear',
    flowRate: 0,
    detectedAt: '',
  });
  const [history, setHistory] = useState([]);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

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
    const leakRef = ref(rtdb, 'leakAlert');
    const historyRef = ref(rtdb, 'sensorHistory');

    const unsubConnected = onValue(
      connectedRef,
      (snapshot) => {
        const connected = snapshot.val() === true;
        console.log('Firebase connected:', connected);
        setFirebaseConnected(connected);
      },
      (error) => {
        console.error('Connected listener error:', error);
      }
    );

    const unsubStatus = onValue(
      statusRef,
      (snapshot) => {
        const value = snapshot.val();
        console.log('Status changed:', value);
        setDeviceStatus(value || 'offline');
      },
      (error) => {
        console.error('Status listener error:', error);
      }
    );

    const unsubLastSeen = onValue(
      lastSeenRef,
      (snapshot) => {
        const value = snapshot.val();
        console.log('LastSeen changed:', value);
        setLastSeen(value || '');
      },
      (error) => {
        console.error('LastSeen listener error:', error);
      }
    );

    const unsubReadings = onValue(
      readingsRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('sensorReadings changed:', data);

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

    const unsubLeak = onValue(
      leakRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('leakAlert changed:', data);

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
        console.log('sensorHistory changed:', data);

        if (!data) {
          setHistory([]);
          return;
        }

        const arr = Object.entries(data)
          .map(([key, value]) => ({
            key,
            flowRate: Number(value?.flowRate || 0),
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
      console.log('Cleaning up Firebase listeners...');
      unsubConnected();
      unsubStatus();
      unsubLastSeen();
      unsubReadings();
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
            Real-time water flow tracking, leak detection, and device monitoring.
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

      <section className="stats-grid">
        <StatCard
          title="Current Flow Rate"
          value={`${sensorReadings.flowRate.toFixed(2)} L/min`}
          subtitle={`Updated: ${formatTimestamp(sensorReadings.timestamp) || '—'}`}
        />

        <StatCard
          title="Total Volume"
          value={`${sensorReadings.totalVolume.toFixed(3)} L`}
          subtitle={`Device ID: ${sensorReadings.deviceId}`}
        />

        <StatCard
          title="Last Seen"
          value={formatTimestamp(lastSeen) || '—'}
          subtitle="Latest heartbeat from ESP32"
        />

        <StatCard
          title="System State"
          value={leakIsActive ? 'Leak Detected' : 'Normal'}
          subtitle={leakIsActive ? 'Immediate attention required' : 'Flow condition is stable'}
        />
      </section>

      <section className="content-grid">
        <div className="main-panel">
          <HistoryChart data={history} />
        </div>

        <div className="side-panel">
          <LeakAlertCard leakAlert={leakAlert} />
        </div>
      </section>
      <hr className='mt-5' />
      <Footer />
    </div>
  );
}

export default App;