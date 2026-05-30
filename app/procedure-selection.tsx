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
      {/* Radio */}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>

      {/* Text */}
      <View style={styles.optionTextCol}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleSelected, disabled && styles.optionTitleDisabled]}>
          {title}
        </Text>
        <Text style={[styles.optionDesc, disabled && styles.optionDescDisabled]}>
          {description}
        </Text>
        {disabled && disabledNote && (
          <View style={styles.comingSoonPill}>
            <Text style={styles.comingSoonText}>{disabledNote}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProcedureSelectionScreen() {
  const router = useRouter();
  const { selectedProcedure, setProcedure } = useInstallation();

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <AppHeader title="Installation Type" showBack />

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
          description="Official Nexis 3ph Quick Installation Guide. Covers all mechanical, electrical, and commissioning steps."
          onSelect={() => setProcedure('solaredge')}
        />

        <OptionCard
          value="tpo"
          selected={selectedProcedure === 'tpo'}
          title="Palmetto Finance TPO"
          description="Adds TPO-specific requirements on top of all SolarEdge steps. For TPO-financed jobs only."
          disabled
          disabledNote="Coming soon"
          onSelect={() => {}}
        />

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.iconBlue} />
          <Text style={styles.infoText}>
            TPO checklist items are additive — all SolarEdge steps are always included.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/step')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaBtnText}>Begin Installation</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SELECTED_COLOR = Colors.headerBg; // #0D1B2A navy
const SELECTED_BG = '#EEF1F4';          // very light navy tint

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },

  headerBlock: { paddingBottom: 4, gap: 4 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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

  // Radio
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
  radioSelected: {
    borderColor: SELECTED_COLOR,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SELECTED_COLOR,
  },

  // Text
  optionTextCol: { flex: 1, gap: 4 },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTitleSelected: {
    color: SELECTED_COLOR,
    fontWeight: '700',
  },
  optionTitleDisabled: {
    color: Colors.textSecondary,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  optionDescDisabled: {
    color: Colors.textMuted,
  },

  // Coming soon pill
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

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.iconBoxBlue,
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.iconBlue,
    lineHeight: 18,
  },

  // CTA
  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});
