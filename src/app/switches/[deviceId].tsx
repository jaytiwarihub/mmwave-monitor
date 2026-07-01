import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SwitchTile from '../../components/SwitchTile';
import { useMQTT } from '../../hooks/useMQTT';
import { useAppStore } from '../../store/useAppStore';

export default function SwitchesScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const { publishSwitchCommand } = useMQTT();

  // Select the raw arrays only. Deriving with .find()/.filter() INSIDE
  // the selector returns a new array/reference on every call, which
  // breaks React 18's useSyncExternalStore snapshot check (it looks like
  // the store changed every render) and causes an infinite render loop.
  // Doing the derivation here in the component body avoids that.
  const devices = useAppStore((s) => s.devices);
  const allSwitches = useAppStore((s) => s.switches);

  const device = devices.find((d) => d.id === deviceId);
  const switches = allSwitches.filter((sw) => sw.deviceId === deviceId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{device?.name ?? 'Controls'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {switches.length === 0 ? (
          <Text style={styles.emptyText}>No switches configured for this device.</Text>
        ) : (
          switches.map((sw) => (
            <SwitchTile
              key={sw.id}
              config={sw}
              onToggle={() => publishSwitchCommand(sw.deviceId, sw.id, !sw.isOn)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 24,
  },
  backText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#64748b',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0f172a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Arial',
    color: '#708090',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
    marginTop: 30,
  },
});
