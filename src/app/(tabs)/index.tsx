import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import StatusPill from '../../components/StatusPill';
import DeviceCard from '../../components/DeviceCard';

export default function DashboardScreen() {
  const isConnected = useAppStore((s) => s.isConnected);
  const devices = useAppStore((s) => s.devices);
  const availableDevices = useAppStore((s) => s.availableDevices);
  const activateDevice = useAppStore((s) => s.activateDevice);
  const deactivateDevice = useAppStore((s) => s.deactivateDevice);

  const [showAddList, setShowAddList] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
        <StatusPill isConnected={isConnected} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {devices.length === 0 && (
          <Text style={styles.emptyText}>No devices active. Tap "Add Device" to activate one.</Text>
        )}

        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onPress={() => router.push(`/switches/${device.id}`)}
            onDeactivate={() => deactivateDevice(device.id)}
          />
        ))}

        {showAddList && (
          <View style={styles.addList}>
            <Text style={styles.addListTitle}>Activate a registered device</Text>
            {availableDevices.length === 0 ? (
              <Text style={styles.emptyText}>No pre-registered devices left to activate.</Text>
            ) : (
              availableDevices.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.availableRow}
                  onPress={() => {
                    activateDevice(d.id);
                    setShowAddList(false);
                  }}
                >
                  <View>
                    <Text style={styles.availableName}>{d.name}</Text>
                    <Text style={styles.availableRoom}>{d.room}</Text>
                  </View>
                  <Text style={styles.plus}>+</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddList((v) => !v)}>
          <Text style={styles.addButtonText}>Add Device</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    fontFamily: 'Arial',
    color: '#708090',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
  addList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 4,
  },
  addListTitle: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10,
  },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  availableName: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#0f172a',
  },
  availableRoom: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#708090',
    marginTop: 1,
  },
  plus: {
    fontSize: 20,
    color: '#29B6F6',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  addButton: {
    backgroundColor: '#29B6F6',
    paddingHorizontal: 34,
    paddingVertical: 11,
    borderRadius: 20,
  },
  addButtonText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#ffffff',
  },
});
