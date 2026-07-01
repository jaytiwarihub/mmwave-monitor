import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface StatusPillProps {
  isConnected: boolean;
}

export default function StatusPill({ isConnected }: StatusPillProps) {
  return (
    <Text style={[styles.pill, isConnected ? styles.connected : styles.disconnected]}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  connected: {
    color: '#4CAF50',
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
  },
  disconnected: {
    color: '#29B6F6',
    borderColor: '#29B6F6',
    backgroundColor: 'rgba(41, 182, 246, 0.08)',
  },
});
