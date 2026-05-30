import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useInstallation } from '@/context/InstallationContext';

export default function SummaryScreen() {
  const router = useRouter();
  const { currentStepIndex, steps, siteDetails } = useInstallation();

  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const totalSteps = steps.length;

  const handleResume = () => {
    router.replace('/step');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Installation Summary</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Site card */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Ionicons name="location-outline" size={18} color={Colors.accent} />
            <Text style={styles.cardLabel}>Installation Site</Text>
          </View>
          <Text style={styles.siteName}>{siteDetails.siteName}</Text>
          <Text style={styles.siteDetail}>{siteDetails.customerName}</Text>
          <Text style={styles.siteDetail}>{siteDetails.address}</Text>
        </View>

        {/* Progress card */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Ionicons name="bar-chart-outline" size={18} color={Colors.accent} />
            <Text style={styles.cardLabel}>Progress</Text>
          </View>
          <Text style={styles.progressCount}>
            {completedCount} of {totalSteps} steps completed
          </Text>
          <Text style={styles.lastStep}>
            Last step: Step {currentStepIndex + 1}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(completedCount / totalSteps) * 100}%` as any }]} />
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.resumeBtn} onPress={handleResume} activeOpacity={0.8}>
          <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.textWhite} />
          <Text style={styles.resumeBtnText}>Back to Installation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome} activeOpacity={0.8}>
          <Ionicons name="home-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },

  // Header
  headerSafe: { backgroundColor: Colors.headerBg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.headerBg,
  },
  headerSpacer: { width: 44 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textWhite },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  // Cards
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 4,
  },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  siteName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  siteDetail: { fontSize: 14, color: Colors.textSecondary },

  progressCount: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  lastStep: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },

  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },

  // Buttons
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
  },
  resumeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },

  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  homeBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
