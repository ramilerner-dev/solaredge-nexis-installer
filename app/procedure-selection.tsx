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
  tag?: string;
  onSelect: () => void;
}

function OptionCard({ value, selected, title, description, tag, onSelect }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Radio */}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>

      {/* Text */}
      <View style={styles.optionTextCol}>
        <View style={styles.optionTitleRow}>
          <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
            {title}
          </Text>
          {tag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          )}
        </View>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProcedureSelectionScreen() {
  const router = useRouter();
  const { selectedProcedure, setProcedure } = useInstallation();

  const handleBegin = () => {
    router.push('/step');
  };

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
          <Text style={styles.subheading}>
            Choose which standard to follow for this installation.
          </Text>
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
          title="TPO"
          tag="Palmetto Finance"
          description="Adds TPO-specific requirements on top of all SolarEdge steps. Select only for TPO-financed jobs."
          onSelect={() => setProcedure('tpo')}
        />

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.iconBlue} />
          <Text style={styles.infoText}>
            TPO checklist items are additive — all SolarEdge steps are always included.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleBegin} activeOpacity={0.8}>
          <Text style={styles.ctaBtnText}>Begin Installation</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },

  headerBlock: {
    paddingBottom: 4,
    gap: 4,
  },
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
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },

  // Radio button
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
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },

  // Text content
  optionTextCol: { flex: 1, gap: 4 },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionTitleSelected: {
    color: Colors.accent,
  },
  optionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Tag pill
  tag: {
    backgroundColor: Colors.iconBoxBlue,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.iconBlue,
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
