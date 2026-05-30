import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type NavTab = 'install' | 'service' | 'manage';

interface BottomNavProps {
  activeTab?: NavTab;
}

const TABS: {
  key: NavTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'install', label: 'Install', icon: 'construct-outline', activeIcon: 'construct' },
  { key: 'service', label: 'Service', icon: 'warning-outline', activeIcon: 'warning' },
  { key: 'manage', label: 'Manage', icon: 'location-outline', activeIcon: 'location' },
];

export default function BottomNav({ activeTab = 'install' }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.border} />
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              activeOpacity={isActive ? 1 : 0.6}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? Colors.navActive : Colors.navInactive}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.navBg,
  },
  border: {
    height: 1,
    backgroundColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    height: 56,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    color: Colors.navInactive,
    fontWeight: '400',
  },
  labelActive: {
    color: Colors.navActive,
    fontWeight: '600',
  },
});
