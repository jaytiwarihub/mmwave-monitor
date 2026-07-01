import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';

export default function SettingsScreen() {
  const autoReconnect = useAppStore((s) => s.autoReconnect);
  const setAutoReconnect = useAppStore((s) => s.setAutoReconnect);
  const presenceTimeout = useAppStore((s) => s.presenceTimeout);
  const setPresenceTimeout = useAppStore((s) => s.setPresenceTimeout);
  const resetAll = useAppStore((s) => s.resetAll);

  const handleClearData = () => {
    resetAll();
    router.replace('/onboarding');
  };

  const pct = ((presenceTimeout - 1) / 9) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Auto-reconnect</Text>
            <Text style={styles.subLabel}>Reconnect to the broker automatically if the connection drops</Text>
          </View>
          <Switch
            value={autoReconnect}
            onValueChange={setAutoReconnect}
            trackColor={{ false: '#cbd5e1', true: '#4CAF50' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.group}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Presence timeout</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                disabled={presenceTimeout <= 1}
                onPress={() => setPresenceTimeout(Math.max(1, presenceTimeout - 1))}
              >
                <Text style={[styles.stepBtnText, presenceTimeout <= 1 && styles.stepBtnDisabled]}>−</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{presenceTimeout} min</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                disabled={presenceTimeout >= 10}
                onPress={() => setPresenceTimeout(Math.min(10, presenceTimeout + 1))}
              >
                <Text style={[styles.stepBtnText, presenceTimeout >= 10 && styles.stepBtnDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
            <View style={[styles.thumb, { left: `${pct}%` }]} />
          </View>

          <View style={styles.minMaxRow}>
            <Text style={styles.minMaxText}>1m</Text>
            <Text style={styles.minMaxText}>5m</Text>
            <Text style={styles.minMaxText}>10m</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearData} activeOpacity={0.8}>
          <Text style={styles.clearButtonText}>Clear all data</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 22,
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  group: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 15,
  },
  subLabel: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepBtnText: {
    fontSize: 16,
    color: '#29B6F6',
    fontWeight: 'bold',
  },
  stepBtnDisabled: {
    color: '#cbd5e1',
  },
  sliderValue: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#29B6F6',
    fontSize: 14,
    minWidth: 52,
    textAlign: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  fill: {
    height: 6,
    backgroundColor: '#29B6F6',
    borderRadius: 3,
    position: 'absolute',
  },
  thumb: {
    width: 18,
    height: 18,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#29B6F6',
    borderRadius: 9,
    position: 'absolute',
    top: -6,
    marginLeft: -9,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minMaxText: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#708090',
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF5252',
    backgroundColor: '#FFF0F0',
  },
  clearButtonText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#FF5252',
    fontSize: 15,
  },
});
