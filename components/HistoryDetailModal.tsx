import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import STEPS from '@/data/steps';
import type { HistoryEntry } from '@/context/InstallationContext';
import { formatTimestamp, storageEstimate } from '@/utils/validation';
import { completedCount, totalPhotos } from '@/utils/stepUtils';
import JpegFullscreenModal from './JpegFullscreenModal';

export default function HistoryDetailModal({
  visible,
  entry,
  onClose,
  onResume,
  onStartNew,
}: {
  visible: boolean;
  entry: HistoryEntry | null;
  onClose: () => void;
  onResume: (id: string) => void;
  onStartNew: (id: string) => void;
}) {
  const [jpegVisible, setJpegVisible] = useState(false);

  if (!entry) return null;

  const completed = completedCount(entry.steps);
  const total = entry.steps.length;
  const photos = totalPhotos(entry.steps);
  const storage = storageEstimate(photos);
  const isComplete = completed === total;

  const dateLabel = formatDate(entry.date);

  const handleResume = () => {
    Alert.alert(
      'Resume Installation',
      'Installation date will change to today’s date. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => onResume(entry.id) },
      ]
    );
  };

  const handleStartNew = () => {
    Alert.alert(
      'Start New Installation',
      'Begin a new installation. This saved entry will remain in history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => onStartNew(entry.id) },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        {/* Header */}
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Installation Summary</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Date banner */}
          <View style={styles.dateBanner}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>Saved {dateLabel}</Text>
          </View>

          {/* Site card */}
          <View style={styles.card}>
            <View style={styles.cardIconRow}>
              <Ionicons name="location-outline" size={18} color={Colors.accent} />
              <Text style={styles.cardLabel}>Installation Site</Text>
            </View>
            <Text style={styles.siteName}>{entry.siteDetails.siteName}</Text>
            <Text style={styles.siteDetail}>{entry.siteDetails.customerName}</Text>
            <Text style={styles.siteDetail}>{entry.siteDetails.address}</Text>

            {entry.siteDetails.notes.trim().length > 0 && (
              <View style={styles.notesBlock}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesBody}>{entry.siteDetails.notes}</Text>
              </View>
            )}
          </View>

          {/* Progress card */}
          <View style={styles.card}>
            <View style={styles.cardIconRow}>
              <Ionicons name="bar-chart-outline" size={18} color={Colors.accent} />
              <Text style={styles.cardLabel}>Progress</Text>
            </View>
            <Text style={styles.progressCount}>
              {completed} of {total} steps completed
            </Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${(completed / total) * 100}%` as any }]} />
            </View>
            <View style={styles.photoRow}>
              <Ionicons name="camera-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.photoRowText}>
                {photos} {photos === 1 ? 'photo' : 'photos'} · {storage}
              </Text>
            </View>
          </View>

          {/* Steps list with placeholder photo frames */}
          <View style={styles.card}>
            <View style={styles.cardIconRow}>
              <Ionicons name="list-outline" size={18} color={Colors.accent} />
              <Text style={styles.cardLabel}>Steps</Text>
            </View>

            {STEPS.map((step, index) => {
              const state = entry.steps[index];
              const stepComplete = state?.status === 'complete';
              const photoCount = state?.photoCount ?? 0;
              const isLast = index === STEPS.length - 1;

              return (
                <View key={step.id} style={[styles.stepBlock, !isLast && styles.stepBlockBorder]}>
                  <View style={styles.stepRow}>
                    <Ionicons
                      name={stepComplete ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={stepComplete ? Colors.success : Colors.textMuted}
                    />
                    <Text style={[styles.stepTitle, !stepComplete && styles.stepTitlePending]}>
                      Step {step.id}: {step.title}
                    </Text>
                    {stepComplete && (
                      <Text style={styles.stepTime}>{formatTimestamp(state.completedAt)}</Text>
                    )}
                  </View>

                  {photoCount > 0 && (
                    <View style={styles.photosWrap}>
                      {Array.from({ length: photoCount }).map((_, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.jpegFrame}
                          onPress={() => setJpegVisible(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.jpegLabel}>JPEG</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action buttons */}
          {!isComplete && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleResume} activeOpacity={0.8}>
              <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.textWhite} />
              <Text style={styles.primaryBtnText}>Resume Installation</Text>
            </TouchableOpacity>
          )}
          {isComplete && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleStartNew} activeOpacity={0.8}>
              <Ionicons name="refresh-circle-outline" size={20} color={Colors.textWhite} />
              <Text style={styles.primaryBtnText}>Start New Installation</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="list-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.secondaryBtnText}>Back to List</Text>
          </TouchableOpacity>
        </ScrollView>

        <JpegFullscreenModal visible={jpegVisible} onClose={() => setJpegVisible(false)} />
      </View>
    </Modal>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },

  headerSafe: { backgroundColor: Colors.headerBg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: Colors.headerBg,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textWhite },
  headerSpacer: { width: 44 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  dateText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

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

  notesBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderStyle: 'dashed',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 18 },

  progressCount: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  photoRowText: { fontSize: 13, color: Colors.textSecondary },

  stepBlock: { paddingVertical: 10, gap: 8 },
  stepBlockBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stepTitlePending: { fontWeight: '500', color: Colors.textSecondary },
  stepTime: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  photosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 32,
  },
  jpegFrame: {
    width: 64,
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.textMuted,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jpegLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },

  secondaryBtn: {
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
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
