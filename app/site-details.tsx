import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';
import { useInstallation } from '@/context/InstallationContext';
import { isSiteDetailsValid, siteDetailsError } from '@/utils/validation';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SiteDetailsScreen() {
  const router = useRouter();
  const { siteDetails, updateSiteDetails } = useInstallation();

  const roomSizeBlocking = siteDetails.isIndoor && !siteDetails.roomSizeConfirmed;
  const rainBlocking = !siteDetails.isIndoor && !siteDetails.rainProtectedConfirmed;
  const isValid = isSiteDetailsValid(siteDetails) && !roomSizeBlocking && !rainBlocking;
  const errorMsg = roomSizeBlocking
    ? 'Room size ≥ 2,119 ft³ must be confirmed for indoor installations.'
    : rainBlocking
    ? 'Rain protected location must be confirmed for outdoor installations.'
    : siteDetailsError(siteDetails);

  const handleNext = () => {
    if (isValid) router.push('/procedure-selection');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <AppHeader title="Physical Installation" showBack />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Site Information ── */}
          <SectionHeader title="Site Information" />

          <FieldLabel label="Site Name" required />
          <TextInput
            style={[styles.input, !siteDetails.siteName.trim() && styles.inputError]}
            value={siteDetails.siteName}
            onChangeText={(v) => updateSiteDetails({ siteName: v })}
            placeholder="e.g. Green Valley Solar"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <FieldLabel label="Customer Name" required />
          <TextInput
            style={[styles.input, !siteDetails.customerName.trim() && styles.inputError]}
            value={siteDetails.customerName}
            onChangeText={(v) => updateSiteDetails({ customerName: v })}
            placeholder="e.g. Carlos Mendez"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <FieldLabel label="Site Address" />
          <TextInput
            style={styles.input}
            value={siteDetails.address}
            onChangeText={(v) => updateSiteDetails({ address: v })}
            placeholder="e.g. 14 Sunridge Ave, Utrecht"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          {/* ── Installation Details ── */}
          <SectionHeader title="Installation Details" />

          <FieldLabel label="Installation Location" />
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, siteDetails.isIndoor && styles.segmentActive]}
              onPress={() => updateSiteDetails({ isIndoor: true })}
              activeOpacity={0.8}
            >
              <Ionicons
                name="home-outline"
                size={15}
                color={siteDetails.isIndoor ? Colors.textWhite : Colors.textSecondary}
              />
              <Text style={[styles.segmentText, siteDetails.isIndoor && styles.segmentTextActive]}>
                Indoor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, !siteDetails.isIndoor && styles.segmentActive]}
              onPress={() => updateSiteDetails({ isIndoor: false })}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sunny-outline"
                size={15}
                color={!siteDetails.isIndoor ? Colors.textWhite : Colors.textSecondary}
              />
              <Text style={[styles.segmentText, !siteDetails.isIndoor && styles.segmentTextActive]}>
                Outdoor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Room size — only shown for indoor */}
          {siteDetails.isIndoor && (
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => updateSiteDetails({ roomSizeConfirmed: !siteDetails.roomSizeConfirmed })}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, siteDetails.roomSizeConfirmed && styles.checkboxChecked]}>
                {siteDetails.roomSizeConfirmed && (
                  <Ionicons name="checkmark" size={13} color={Colors.textWhite} />
                )}
              </View>
              <View style={styles.checkTextCol}>
                <Text style={styles.checkLabel}>Room size ≥ 2,119 ft³ confirmed</Text>
                {!siteDetails.roomSizeConfirmed && (
                  <Text style={styles.checkWarning}>
                    ⚠️ Required to continue indoor installation
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Rain protection — only shown for outdoor */}
          {!siteDetails.isIndoor && (
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => updateSiteDetails({ rainProtectedConfirmed: !siteDetails.rainProtectedConfirmed })}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, siteDetails.rainProtectedConfirmed && styles.checkboxChecked]}>
                {siteDetails.rainProtectedConfirmed && (
                  <Ionicons name="checkmark" size={13} color={Colors.textWhite} />
                )}
              </View>
              <View style={styles.checkTextCol}>
                <Text style={styles.checkLabel}>Rain protected location confirmed</Text>
                {!siteDetails.rainProtectedConfirmed && (
                  <Text style={styles.checkWarning}>
                    ⚠️ Required to continue outdoor installation
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          <FieldLabel label="System Type" />
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>{siteDetails.systemType}</Text>
            <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
          </View>

          {/* ── Notes ── */}
          <SectionHeader title="Notes" />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={siteDetails.notes}
            onChangeText={(v) => updateSiteDetails({ notes: v })}
            placeholder="Optional notes for this installation"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Error message */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, !isValid && styles.ctaBtnDisabled]}
            onPress={handleNext}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>Start Installation</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 4,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  required: { color: Colors.danger },

  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  inputDisabled: {
    backgroundColor: Colors.divider,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDisabledText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  // Location toggle
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: Colors.headerBg,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.textWhite,
    fontWeight: '600',
  },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkTextCol: { flex: 1, gap: 2 },
  checkLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  checkWarning: {
    fontSize: 12,
    color: Colors.warning,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
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
    marginTop: 12,
  },
  ctaBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});
