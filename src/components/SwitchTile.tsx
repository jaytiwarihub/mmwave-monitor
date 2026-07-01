import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import type { SwitchConfig } from '../store/useAppStore';

interface SwitchTileProps {
  config: SwitchConfig;
  onToggle: () => void;
}

export default function SwitchTile({ config, onToggle }: SwitchTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.name}>{config.name}</Text>

      <TouchableOpacity
        style={[
          styles.toggle,
          config.isOn ? styles.toggleOn : styles.toggleOff,
          config.pending && styles.togglePending,
        ]}
        activeOpacity={0.8}
        disabled={config.pending}
        onPress={onToggle}
      >
        {config.pending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <View style={[styles.knob, { alignSelf: config.isOn ? 'flex-end' : 'flex-start' }]} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#29B6F6',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#29B6F6',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  name: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 17,
    marginBottom: 18,
  },
  toggle: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#4CAF50',
  },
  toggleOff: {
    backgroundColor: '#9E9E9E',
  },
  togglePending: {
    backgroundColor: '#90A4AE',
    alignItems: 'center',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
});
