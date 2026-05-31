import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import BottomNav from '@/components/BottomNav';
import HistoryListModal from '@/components/HistoryListModal';
import { useInstallation } from '@/context/InstallationContext';
import STEPS from '@/data/steps';
import { completedCount } from '@/utils/stepUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  titleNote?: string; // rendered inline after title in gray
  subtitle: string;
  tappable: boolean;
  isNew?: boolean;
  onPress?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const APP_VERSION = 'v0.1.1';

// ─── Resume Bottom Sheet ──────────────────────────────────────────────────────

function ResumeSheet({
  visible,
  stepNumber,
  totalSteps,
  stepTitle,
  completed,
  onResume,
  onStartFresh,
  onClose,
}: {
  visible: boolean;
  stepNumber: number;
  totalSteps: number;
  stepTitle: string;
  completed: number;
  onResume: () => void;
  onStartFresh: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sheetStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={sheetStyles.container}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>Resume Installation?</Text>
        <Text style={sheetStyles.subtitle}>
          You have an installation in progress at Step {stepNumber} of {totalSteps}.
        </Text>
        <Text style={sheetStyles.stepLine}>{stepTitle}</Text>
        <Text style={sheetStyles.progressLine}>
          {completed} of {totalSteps} steps completed
        </Text>

        <TouchableOpacity style={sheetStyles.resumeBtn} onPress={onResume} activeOpacity={0.8}>
          <Ionicons name="arrow-forward-circle" size={20} color={Colors.textWhite} />
          <Text style={sheetStyles.resumeBtnText}>Resume Installation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={sheetStyles.freshBtn} onPress={onStartFresh} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color={Colors.danger} />
          <Text style={sheetStyles.freshBtnText}>Start Fresh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={sheetStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={sheetStyles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function GoHeader() {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity style={headerStyles.iconBtn} activeOpacity={0.7}>
        <Ionicons name="menu" size={24} color={Colors.textWhite} />
      </TouchableOpacity>

      {/* SolarEdge logo + version */}
      <View style={headerStyles.logoRow}>
        <Image
          source={require('@/assets/solaredge-logo.png')}
          style={headerStyles.logoImage}
          resizeMode="contain"
          fadeDuration={0}
        />
        <View style={headerStyles.versionPill}>
          <Text style={headerStyles.versionText}>{APP_VERSION}</Text>
        </View>
      </View>

      <TouchableOpacity style={headerStyles.iconBtn} activeOpacity={0.7}>
        <Ionicons name="search" size={22} color={Colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

function InstallTabBar() {
  return (
    <View style={tabBarStyles.container}>
      <View style={tabBarStyles.activeTab}>
        <Text style={tabBarStyles.activeLabel}>Install</Text>
      </View>
    </View>
  );
}

function WeatherWidget() {
  return (
    <View style={widgetStyles.container}>
      <View style={widgetStyles.weatherRow}>
        <Ionicons name="partly-sunny" size={16} color="#F59E0B" />
        <Text style={widgetStyles.temp}> 12°c</Text>
      </View>
      <Text style={widgetStyles.welcome}>Welcome, John!</Text>
    </View>
  );
}

function InstallCard({ card }: { card: CardConfig }) {
  const content = (
    <View style={[styles.card, card.isNew && styles.cardNew]}>
      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
        <Ionicons name={card.icon} size={28} color={card.iconColor} />
      </View>

      {/* Text */}
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>
          {card.title}
          {card.titleNote && (
            <Text style={styles.cardTitleNote}> {card.titleNote}</Text>
          )}
        </Text>
        {card.subtitle.length > 0 && (
          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
        )}
      </View>

      {/* NEW badge or chevron */}
      {card.isNew ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      )}
    </View>
  );

  if (card.tappable && card.onPress) {
    return (
      <TouchableOpacity onPress={card.onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { installationInProgress, currentStepIndex, startFresh, history } = useInstallation();
  const { steps } = useInstallation();
  const [resumeSheetVisible, setResumeSheetVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  const completed = completedCount(steps);
  const savedStepNumber = currentStepIndex + 1;
  const savedStepTitle = STEPS[currentStepIndex]?.title ?? '';

  const handleInstallTap = () => {
    if (installationInProgress) {
      setResumeSheetVisible(true);
    } else {
      router.push('/site-details');
    }
  };

  const handleResume = () => {
    setResumeSheetVisible(false);
    router.push('/step');
  };

  const handleStartFresh = () => {
    setResumeSheetVisible(false);
    startFresh();
    router.push('/site-details');
  };

  const cards: CardConfig[] = [
    {
      icon: 'clipboard-outline',
      iconBg: Colors.iconBoxAccent,
      iconColor: Colors.accent,
      title: 'Install',
      subtitle: installationInProgress
        ? `In progress — Step ${savedStepNumber} of ${STEPS.length}`
        : 'Physical installation procedure',
      tappable: true,
      isNew: true,
      onPress: handleInstallTap,
    },
    {
      icon: 'business-outline',
      iconBg: Colors.iconBoxBlue,
      iconColor: Colors.iconBlue,
      title: 'Commission',
      subtitle: 'New system',
      tappable: false,
    },
    {
      icon: 'qr-code-outline',
      iconBg: Colors.iconBoxGray,
      iconColor: Colors.iconGray,
      title: 'Connect',
      subtitle: 'Installed system',
      tappable: false,
    },
    {
      icon: 'swap-horizontal-outline',
      iconBg: Colors.iconBoxGray,
      iconColor: Colors.iconGray,
      title: 'Replace',
      subtitle: 'Inverter or Optimizer',
      tappable: false,
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Status bar area + header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <GoHeader />
        <InstallTabBar />
      </SafeAreaView>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WeatherWidget />
        {cards.map((card) => (
          <InstallCard key={card.title} card={card} />
        ))}

        <View style={styles.otherDivider} />
        <Text style={styles.otherLabel}>OTHER</Text>
        <TouchableOpacity
          style={styles.historyRow}
          onPress={() => setHistoryVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.historyRowLabel}>Installation History</Text>
          {history.length > 0 && (
            <Text style={styles.historyCount}>{history.length} saved</Text>
          )}
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom nav */}
      <SafeAreaView style={styles.navSafe} edges={['bottom']}>
        <BottomNav activeTab="install" />
      </SafeAreaView>

      {/* Installation history modal */}
      <HistoryListModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onResumeNavigate={() => router.push('/step')}
        onStartNewNavigate={() => router.push('/site-details')}
      />

      {/* Resume installation sheet */}
      <ResumeSheet
        visible={resumeSheetVisible}
        stepNumber={savedStepNumber}
        totalSteps={STEPS.length}
        stepTitle={savedStepTitle}
        completed={completed}
        onResume={handleResume}
        onStartFresh={handleStartFresh}
        onClose={() => setResumeSheetVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: Colors.headerBg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 30,
    width: 130,
    backgroundColor: Colors.headerBg,
  },
  versionPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
});

const tabBarStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerBg,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
    marginBottom: -1,
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});

const widgetStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  temp: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  welcome: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bodyBg,
  },
  headerSafe: {
    backgroundColor: Colors.headerBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  navSafe: {
    backgroundColor: Colors.navBg,
  },

  // Cards
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardNew: {
    borderWidth: 1.5,
    borderColor: Colors.accent + '30', // 19% opacity accent border
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardTitleNote: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  newBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },

  // OTHER section
  otherDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginTop: 18,
    marginBottom: 10,
  },
  otherLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginLeft: 4,
    marginBottom: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyRowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  historyCount: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 6,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  stepLine: { fontSize: 14, color: Colors.textPrimary, textAlign: 'center', fontWeight: '600', marginTop: 6 },
  progressLine: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 14 },

  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
  },
  resumeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },

  freshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  freshBtnText: { fontSize: 14, fontWeight: '600', color: Colors.danger },

  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
});
