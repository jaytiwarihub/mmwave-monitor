import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/useAppStore';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity key={route.key} style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <View style={isFocused ? styles.activeLine : styles.inactiveLine} />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const hasConnectedOnce = useAppStore((s) => s.hasConnectedOnce);

  // (tabs)/index.tsx resolves to the bare "/" route since group folders
  // don't appear in the URL. Without this gate, a cold start would land
  // directly on the Dashboard and skip the broker connection entirely.
  if (!hasConnectedOnce) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    backgroundColor: '#000000',
  },
  inactiveLine: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#708090',
    fontSize: 13,
  },
  labelActive: {
    color: '#000000',
  },
});
