import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet } from 'react-native';
import mqtt from 'mqtt';

export default function App() {
  const [brokerUrl, setBrokerUrl] = useState('ws://192.168.x.x:9001');
  const [topic, setTopic] = useState('esp32/mmwave');
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState(false);
  const [lastSeen, setLastSeen] = useState('—');
  const [detections, setDetections] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [rssi, setRssi] = useState('—');
  const [logs, setLogs] = useState([]);
  const clientRef = useRef(null);

  const connect = () => {
    const client = mqtt.connect(brokerUrl);
    clientRef.current = client;
    client.on('connect', () => {
      client.subscribe(topic);
      setConnected(true);
    });
    client.on('message', (t, msg) => {
      const raw = msg.toString();
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = { presence: raw }; }
      const detected = parsed.presence === 1 || parsed.presence === '1' || parsed.presence === true || raw === '1';
      if (parsed.rssi) setRssi(parsed.rssi);
      const now = new Date().toLocaleTimeString();
      setPresence(detected);
      setLastSeen(now);
      setMsgCount(c => c + 1);
      if (detected) setDetections(c => c + 1);
      setLogs(l => [{ time: now, payload: raw, detected }, ...l.slice(0, 19)]);
    });
    client.on('error', () => setConnected(false));
    client.on('close', () => setConnected(false));
  };

  const disconnect = () => {
    clientRef.current?.end();
    setConnected(false);
  };

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.container}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>mmWave Monitor</Text>
        <View style={[s.badge, connected ? s.badgeOn : s.badgeOff]}>
          <Text style={[s.badgeText, connected ? s.badgeTextOn : s.badgeTextOff]}>
            {connected ? '● Connected' : '● Disconnected'}
          </Text>
        </View>
      </View>

      {/* Connection inputs */}
      <TextInput style={s.input} value={brokerUrl} onChangeText={setBrokerUrl} placeholder="ws://192.168.x.x:9001" />
      <TextInput style={s.input} value={topic} onChangeText={setTopic} placeholder="esp32/mmwave" />
      <TouchableOpacity style={s.btn} onPress={connected ? disconnect : connect}>
        <Text style={s.btnText}>{connected ? 'Disconnect' : 'Connect'}</Text>
      </TouchableOpacity>

      {/* Presence card */}
      <View style={[s.card, presence ? s.cardOn : s.cardOff]}>
        <Text style={s.cardIcon}>{presence ? '🧍' : '🔍'}</Text>
        <Text style={s.cardTitle}>{presence ? 'Human Detected' : 'No Presence'}</Text>
        <Text style={s.cardSub}>Last updated: {lastSeen}</Text>
      </View>

      {/* Metrics */}
      <View style={s.metrics}>
        <View style={s.metric}><Text style={s.metricVal}>{detections}</Text><Text style={s.metricLabel}>Detections</Text></View>
        <View style={s.metric}><Text style={s.metricVal}>{msgCount}</Text><Text style={s.metricLabel}>Messages</Text></View>
        <View style={s.metric}><Text style={s.metricVal}>{rssi}</Text><Text style={s.metricLabel}>RSSI</Text></View>
      </View>

      {/* Log */}
      <Text style={s.sectionTitle}>Live Log</Text>
      {logs.length === 0 && <Text style={s.empty}>No messages yet...</Text>}
      {logs.map((l, i) => (
        <View key={i} style={s.logRow}>
          <Text style={s.logTime}>{l.time}</Text>
          <Text style={s.logPayload}>{l.payload}</Text>
          <View style={[s.tag, l.detected ? s.tagOn : s.tagOff]}>
            <Text style={s.tagText}>{l.detected ? 'detected' : 'clear'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0f0f0f' },
  container: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', color: '#fff' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeOn: { backgroundColor: '#0d3d2e' },
  badgeOff: { backgroundColor: '#2a1a1a' },
  badgeText: { fontSize: 12 },
  badgeTextOn: { color: '#1D9E75' },
  badgeTextOff: { color: '#e05c5c' },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 14 },
  btn: { backgroundColor: '#1D9E75', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  cardOn: { backgroundColor: '#0d3d2e' },
  cardOff: { backgroundColor: '#1a1a1a' },
  cardIcon: { fontSize: 48, marginBottom: 10 },
  cardTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  metric: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, alignItems: 'center' },
  metricVal: { fontSize: 24, fontWeight: '600', color: '#fff' },
  metricLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 13, color: '#888', marginBottom: 10, fontWeight: '500' },
  empty: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 10, marginBottom: 6, gap: 8 },
  logTime: { fontSize: 11, color: '#555', width: 70, fontFamily: 'monospace' },
  logPayload: { fontSize: 12, color: '#ccc', flex: 1, fontFamily: 'monospace' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagOn: { backgroundColor: '#0d3d2e' },
  tagOff: { backgroundColor: '#2a2a2a' },
  tagText: { fontSize: 11, color: '#1D9E75' },
});
