import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useInstallation } from '@/context/InstallationContext';
import STEPS from '@/data/steps';
import DiagramImages from '@/constants/DiagramImages';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DIAGRAM_HEIGHT = Math.round(SCREEN_HEIGHT * 0.42);

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

interface SheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function BottomSheet({
  visible,
  title,
  subtitle,
  options,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: SheetOption[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={onClose} />
      <View style={sheet.container}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>{title}</Text>
        {subtitle && <Text style={sheet.subtitle}>{subtitle}</Text>}
        <View style={sheet.divider} />
        {options.map((opt) => (
          <TouchableOpacity key={opt.label} style={sheet.option} onPress={opt.onPress} activeOpacity={0.7}>
            <Text style={[sheet.optionText, opt.destructive && sheet.optionDestructive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={sheet.cancel} onPress={onClose} activeOpacity={0.7}>
          <Text style={sheet.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StepScreen() {
  const router = useRouter();
  const {
    currentStepIndex,
    steps,
    toggleStepComplete,
    addPhoto,
    exitInstallation,
    setCurrentStepIndex,
  } = useInstallation();

  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [diagramModalVisible, setDiagramModalVisible] = useState(false);
  const [currentDiagramIndex, setCurrentDiagramIndex] = useState(0);

  const stepData = STEPS[currentStepIndex];
  const stepState = steps[currentStepIndex];
  const photoCount = stepState?.photoCount ?? 0;
  const isComplete = stepState?.status === 'complete';
  const totalSteps = STEPS.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const hasMultipleDiagrams = stepData?.diagramFiles.length > 1;

  // Reset diagram page when step changes
  useEffect(() => {
    setCurrentDiagramIndex(0);
  }, [currentStepIndex]);

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      router.back();
    }
  };

  const handleExitToSummary = () => {
    exitInstallation(currentStepIndex);
    router.replace('/summary');
  };

  const handleNextStep = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      exitInstallation(currentStepIndex);
      router.replace('/summary');
    }
  };

  const handleAddPhoto = () => {
    addPhoto(currentStepIndex);
    setPhotoSheetVisible(false);
  };

  const handleDiagramScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentDiagramIndex(page);
  };

  if (!stepData) return null;

  const currentDiagramSource = DiagramImages[stepData.diagramFiles[currentDiagramIndex]];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={Colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Step {currentStepIndex + 1} of {totalSteps}</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={handleExitToSummary} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Diagram carousel — always visible at top */}
      <View style={styles.diagramSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleDiagramScroll}
          style={styles.diagramScroll}
        >
          {stepData.diagramFiles.map((file) => (
            <TouchableOpacity
              key={file}
              onPress={() => setDiagramModalVisible(true)}
              activeOpacity={0.95}
              style={styles.diagramPage}
            >
              <Image
                source={DiagramImages[file]}
                style={styles.diagramImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expand icon */}
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setDiagramModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="expand-outline" size={16} color="#fff" />
        </TouchableOpacity>

        {/* Dot indicators — only when multiple diagrams */}
        {hasMultipleDiagrams && (
          <View style={styles.dotsRow}>
            {stepData.diagramFiles.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentDiagramIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>

      {/* Scrollable instructions */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>{stepData.title}</Text>

        <View style={styles.instructionList}>
          {stepData.instructions.map((line, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{line}</Text>
            </View>
          ))}
        </View>

        {stepData.hasPassCriteria && stepData.passNote && (
          <View style={styles.passCriteriaBox}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
            <Text style={styles.passCriteriaText}>{stepData.passNote}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        {photoCount > 0 && (
          <View style={styles.photoCountRow}>
            <Ionicons name="camera" size={14} color={Colors.success} />
            <Text style={styles.photoCountText}>{photoCount} photo{photoCount > 1 ? 's' : ''} added</Text>
          </View>
        )}

        <View style={styles.topActionRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => setPhotoSheetVisible(true)} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.photoBtnText}>Add Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isComplete && styles.toggleBtnChecked]}
            onPress={() => toggleStepComplete(currentStepIndex)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isComplete ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={isComplete ? Colors.textWhite : Colors.textSecondary}
            />
            <Text style={[styles.toggleBtnText, isComplete && styles.toggleBtnCheckedText]}>
              {isComplete ? 'Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>{isLastStep ? 'Finish' : 'Next Step'}</Text>
          <Ionicons
            name={isLastStep ? 'checkmark-done' : 'arrow-forward'}
            size={18}
            color={Colors.textWhite}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Photo bottom sheet */}
      <BottomSheet
        visible={photoSheetVisible}
        title="Add Photo"
        subtitle={`Step ${currentStepIndex + 1} — ${stepData.title}`}
        options={[
          { label: '📷  Take Photo', onPress: handleAddPhoto },
          { label: '🖼️  Choose from Library', onPress: handleAddPhoto },
        ]}
        onClose={() => setPhotoSheetVisible(false)}
      />

      {/* Fullscreen diagram modal */}
      <Modal
        visible={diagramModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setDiagramModalVisible(false)}
      >
        <View style={styles.diagramModal}>
          <SafeAreaView edges={['top']} style={styles.diagramModalSafe}>
            <TouchableOpacity
              style={styles.diagramModalClose}
              onPress={() => setDiagramModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color={Colors.textWhite} />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.diagramModalBody}>
            <Image source={currentDiagramSource} style={styles.diagramFullscreen} resizeMode="contain" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },

  // Header
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

  // Diagram section
  diagramSection: {
    height: DIAGRAM_HEIGHT,
    backgroundColor: Colors.cardBg,
  },
  diagramScroll: { flex: 1 },
  diagramPage: {
    width: SCREEN_WIDTH,
    height: DIAGRAM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagramImage: {
    width: SCREEN_WIDTH,
    height: DIAGRAM_HEIGHT,
  },
  expandBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.headerBg,
  },

  // Instructions
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24, gap: 14 },

  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  instructionList: { gap: 12 },
  instructionRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  numberText: { fontSize: 12, fontWeight: '700', color: Colors.textWhite },
  instructionText: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },

  // Pass criteria
  passCriteriaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.successLight,
    borderRadius: 10,
    padding: 12,
  },
  passCriteriaText: { flex: 1, fontSize: 13, color: Colors.success, lineHeight: 18 },

  // Bottom bar
  bottomBar: {
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10,
  },
  photoCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoCountText: { fontSize: 13, color: Colors.success, fontWeight: '500' },
  topActionRow: { flexDirection: 'row', gap: 10 },

  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bodyBg,
    borderRadius: 11,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.bodyBg,
    borderRadius: 11,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtnChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  toggleBtnCheckedText: { color: Colors.textWhite },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 11,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },

  // Fullscreen modal
  diagramModal: { flex: 1, backgroundColor: '#000' },
  diagramModalSafe: { backgroundColor: '#000' },
  diagramModalClose: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  diagramModalBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  diagramFullscreen: { width: SCREEN_WIDTH, height: '100%' },
});

// ─── Bottom sheet styles ───────────────────────────────────────────────────────

const sheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 4,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  option: { paddingVertical: 14, alignItems: 'center' },
  optionText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  optionDestructive: { color: Colors.danger },
  cancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
});
