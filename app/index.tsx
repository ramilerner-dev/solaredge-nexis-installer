import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import BottomNav from '@/components/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  tappable: boolean;
  isNew?: boolean;
  onPress?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const APP_VERSION = 'v0.0.4';

function GoHeader() {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity style={headerStyles.iconBtn} activeOpacity={0.7}>
        <Ionicons name="menu" size={24} color={Colors.textWhite} />
      </TouchableOpacity>

      {/* SolarEdge wordmark + version */}
      <View style={headerStyles.logoRow}>
        <Text style={headerStyles.logoSolar}>solar</Text>
        <Text style={headerStyles.logoEdge}>edge</Text>
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
      <Text style={widgetStyles.welcome}>Welcome, Carlos!</Text>
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
        <Text style={styles.cardTitle}>{card.title}</Text>
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

  const cards: CardConfig[] = [
    {
      icon: 'business-outline',
      iconBg: Colors.iconBoxBlue,
      iconColor: Colors.iconBlue,
      title: 'Install',
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
    {
      icon: 'clipboard-outline',
      iconBg: Colors.iconBoxAccent,
      iconColor: Colors.accent,
      title: 'Physical Installation',
      subtitle: '',
      tappable: true,
      isNew: true,
      onPress: () => router.push('/site-details'),
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
      </ScrollView>

      {/* Bottom nav */}
      <SafeAreaView style={styles.navSafe} edges={['bottom']}>
        <BottomNav activeTab="install" />
      </SafeAreaView>
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
  logoSolar: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  logoEdge: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
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
});
