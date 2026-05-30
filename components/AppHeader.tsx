import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  showExit?: boolean;
  onExit?: () => void;
}

export default function AppHeader({
  title,
  showMenu = false,
  showSearch = false,
  showBack = false,
  showExit = false,
  onExit,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        {/* Left side */}
        <View style={styles.side}>
          {showMenu && (
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="menu" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          )}
          {showBack && (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
          )}
          {showExit && (
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onExit}>
              <Ionicons name="close" size={26} color={Colors.textWhite} />
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Right side */}
        <View style={styles.side}>
          {showSearch && (
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="search" size={22} color={Colors.textWhite} />
            </TouchableOpacity>
          )}
          {!showSearch && !showExit && <View style={styles.iconBtn} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerBg,
  },
  inner: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  side: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textWhite,
    letterSpacing: 0.2,
  },
});
