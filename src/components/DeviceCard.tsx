import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Device } from '../store/useAppStore';

interface DeviceCardProps {
  device: Device;
  onPress: () => void;
  onDeactivate: () => void;
}

export default function DeviceCard({ device, onPress, onDeactivate }: DeviceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
        <Text style={styles.room} numberOfLines={1}>{device.room}</Text>
      </View>

      <View style={styles.right}>
        {device.presenceDetected && (
          <View style={styles.presenceBox}>
            <Text style={styles.presenceText}>HUMAN</Text>
            <Text style={styles.presenceText}>PRESENCE</Text>
          </View>
        )}

        {/* Deactivating only hides it locally — the Sensor ESP32 keeps
            publishing regardless. It returns to the available pool. */}
        <TouchableOpacity
          style={styles.deactivateBtn}
          onPress={(e) => {
            e.stopPropagation();
            onDeactivate();
          }}
        >
          <Text style={styles.deactivateText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#29B6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#29B6F6',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  left: {
    flex: 1,
  },
  name: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 14,
  },
  room: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#708090',
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presenceBox: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 68,
    alignItems: 'center',
  },
  presenceText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 9,
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  deactivateBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  deactivateText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
});
