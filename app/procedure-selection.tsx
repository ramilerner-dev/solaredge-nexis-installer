import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';
import { useInstallation, type Procedure } from '@/context/InstallationContext';

// ─── Option card ──────────────────────────────────────────────────────────────

interface OptionCardProps {
  value: Procedure;
  selected: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  disabledNote?: string;
  onSelect: () => void;
}

function OptionCard({
  selected,
  title,
  description,
  disabled = false,
  disabledNote,
  onSelect,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selected && styles.optionCardSelected,
        disabled && styles.optionCardDisabled,
      ]}
      onPress={disabled ? undefined : onSelect}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>

      <View style={styles.optionTextCol}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleSelected, disabled && styles.optionTitleDisabled]}>
          {title}
        </Text>
        <Text style={styles.optionDesc}>{description}</Text>
        {disabled && disabledNote && (
          <View style={styles.comingSoonPill}>
            <Text style={styles.comingSoonText}>{disabledNote}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Add custom checklist FAB ─────────────────────────────────────────────────

function AddCustomFab() {
  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => {}}>
      <Ionicons name="add" size={18} color={Colors.textSecondary} />
      <Text style={styles.fabText}>Custom Checklist</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProcedureSelectionScreen() {
  const router = useRouter();
  const { selectedProcedure, setProcedure, beginInstallation } = useInstallation();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <AppHeader title="Checklist Selection" showBack />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.heading}>Select Compliance Checklist</Text>
        </View>

        <OptionCard
          value="solaredge"
          selected={selectedProcedure === 'solaredge'}
          title="SolarEdge"
          description="Official Nexis 3ph Quick Installation Guide (updated: Feb 2026)"
          onSelect={() => setProcedure('solaredge')}
        />

        <OptionCard
          value="tpo"
          selected={selectedProcedure === 'tpo'}
          title="Palmetto Finance TPO"
          description="Palmetto Finance checklist for Nexis 3ph installation (updated: TBD)"
          disabled
          onSelect={() => {}}
        />

        {/* FAB centered in the empty space below the cards */}
        <View style={styles.fabArea}>
          <AddCustomFab />
        </View>
      </ScrollView>

      {/* Sticky bottom button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => { beginInstallation(); router.push('/step'); }}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaBtnText}>Begin Installation</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SELECTED_COLOR = Colors.headerBg;
const SELECTED_BG = '#EEF1F4';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  headerSafe: { backgroundColor: Colors.headerBg },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,        // expand to fill scroll area so fabArea gets remaining space
    padding: 16,
    gap: 12,
    paddingBottom: 16,
  },

  headerBlock: { paddingBottom: 4 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Option cards
  optionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: SELECTED_COLOR,
    backgroundColor: SELECTED_BG,
  },
  optionCardDisabled: {
    opacity: 0.45,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: { borderColor: SELECTED_COLOR },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SELECTED_COLOR,
  },

  optionTextCol: { flex: 1, gap: 4 },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTitleSelected: { color: SELECTED_COLOR, fontWeight: '700' },
  optionTitleDisabled: { color: Colors.textSecondary },
  optionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  comingSoonPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.iconBoxGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },

  // FAB wrapper — fills remaining space and centers the button
  fabArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  // Sticky bottom CTA
  bottomBar: {
    backgroundColor: Colors.bodyBg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});
