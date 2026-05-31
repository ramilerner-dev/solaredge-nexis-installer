import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '@/constants/Colors';
import { useInstallation, type HistoryEntry } from '@/context/InstallationContext';
import { completedCount, totalPhotos } from '@/utils/stepUtils';
import HistoryDetailModal from './HistoryDetailModal';

export default function HistoryListModal({
  visible,
  onClose,
  onResumeNavigate,
  onStartNewNavigate,
}: {
  visible: boolean;
  onClose: () => void;
  onResumeNavigate: () => void;
  onStartNewNavigate: () => void;
}) {
  const { history, deleteFromHistory, resumeFromHistory, startNewInstallation } = useInstallation();
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const swipeRefs = useRef<Map<string, Swipeable>>(new Map());

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Installation',
      'Delete this installation from history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeRefs.current.get(id)?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFromHistory(id);
            swipeRefs.current.delete(id);
          },
        },
      ]
    );
  };

  const handleResume = (id: string) => {
    setSelectedEntry(null);
    onClose();
    resumeFromHistory(id);
    onResumeNavigate();
  };

  const handleStartNew = (_id: string) => {
    setSelectedEntry(null);
    onClose();
    startNewInstallation();
    onStartNewNavigate();
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, id: string) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(id)} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color={Colors.textWhite} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const completed = completedCount(item.steps);
    const total = item.steps.length;
    const photos = totalPhotos(item.steps);
    const isComplete = completed === total;

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeRefs.current.set(item.id, ref);
          else swipeRefs.current.delete(item.id);
        }}
        renderRightActions={(progress) => renderRightActions(progress, item.id)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => setSelectedEntry(item)}
          activeOpacity={0.7}
        >
          <View style={styles.rowMain}>
            <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
            <Text style={styles.rowSite} numberOfLines={1}>{item.siteDetails.siteName}</Text>
          </View>
          <View style={styles.rowMeta}>
            <View style={styles.statusPill}>
              <Ionicons
                name={isComplete ? 'checkmark-circle' : 'time-outline'}
                size={12}
                color={isComplete ? Colors.success : Colors.warning}
              />
              <Text style={[styles.statusText, isComplete ? styles.statusComplete : styles.statusInProgress]}>
                {completed}/{total}
              </Text>
            </View>
            {photos > 0 && (
              <View style={styles.photoPill}>
                <Ionicons name="camera" size={11} color={Colors.textSecondary} />
                <Text style={styles.photoPillText}>{photos}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color={Colors.textWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Installation History</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved installations yet</Text>
            <Text style={styles.emptySubtitle}>
              Share or upload a summary to save it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <HistoryDetailModal
          visible={selectedEntry !== null}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onResume={handleResume}
          onStartNew={handleStartNew}
        />
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

  listContent: { paddingTop: 4 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginLeft: 16 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowMain: { flex: 1, gap: 2 },
  rowDate: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.3 },
  rowSite: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.divider,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusComplete: { color: Colors.success },
  statusInProgress: { color: Colors.warning },

  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.divider,
  },
  photoPillText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

  deleteAction: {
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
