import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMQTT } from '../hooks/useMQTT';
import { useAppStore } from '../store/useAppStore';

// There is nothing to collect here. The phone's WiFi connection is set
// up outside the app; the app's only job is to reach the bundled cloud
// MQTT broker. No WiFi name, password, or IP — that's the whole point
// of being on a fixed-hostname cloud broker instead of a local one.
export default function OnboardingScreen() {
  const { connect } = useMQTT();
  const isConnected = useAppStore((s) => s.isConnected);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  useEffect(() => {
    connect();

    const slowTimer = setTimeout(() => setShowSlowNotice(true), 6000);
    return () => clearTimeout(slowTimer);
  }, []);

  useEffect(() => {
    if (isConnected) {
      router.replace('/(tabs)');
    }
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <View style={styles.iconBackground}>
        <ActivityIndicator size="small" color="#38bdf8" />
      </View>
      <Text style={styles.title}>mmWave Smart Room</Text>
      <Text style={styles.subtitle}>
        {showSlowNotice
          ? 'Still trying to reach the cloud broker — check your internet connection.'
          : 'Connecting to cloud broker…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconBackground: {
    backgroundColor: '#e1f5fe',
    width: 84,
    height: 84,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#708090',
    textAlign: 'center',
  },
});
