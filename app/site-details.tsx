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

export default function SiteDetailsScreen() {
  const router = useRouter();
  const { siteDetails, updateSiteDetails } = useInstallation();

  const roomSizeBlocking = siteDetails.isIndoor && !siteDetails.roomSizeConfirmed;
  const rainBlocking = !siteDetails.isIndoor && !siteDetails.rainProtectedConfirmed;
  const isValid = isSiteDetailsValid(siteDetails) && !roomSizeBlocking && !rainBlocking;
  const errorMsg = roomSizeBlocking
    ? 'Room size ≥ 2,200 ft³ must be confirmed for indoor installations.'
    : rainBlocking
    ? 'Rain protected location must be confirmed for outdoor installations.'
    : siteDetailsError(siteDetails);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <AppHeader title="Physical Installation" showBack />
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Site Information ── */}
          <Text style={styles.sectionHeader}>Site Information</Text>

          <Text style={styles.fieldLabel}>Customer Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, !siteDetails.customerName.trim() && styles.inputError]}
            value={siteDetails.customerName}
            onChangeText={(v) => updateSiteDetails({ customerName: v })}
            placeholder="e.g. Andrea Smith"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Site Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, !siteDetails.siteName.trim() && styles.inputError]}
            value={siteDetails.siteName}
            onChangeText={(v) => updateSiteDetails({ siteName: v })}
            placeholder="e.g. Green Valley Solar"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Installer Name</Text>
          <TextInput
            style={styles.input}
            value={siteDetails.installerName}
            onChangeText={(v) => updateSiteDetails({ installerName: v })}
            placeholder="e.g. John Smith"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Site Address</Text>
          <TextInput
            style={styles.input}
            value={siteDetails.address}
            onChangeText={(v) => updateSiteDetails({ address: v })}
            placeholder="e.g. 14 Sunridge Ave, California"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          {/* ── Installation Details ── */}
          <Text style={styles.sectionHeader}>Installation Details</Text>

          <Text style={styles.fieldLabel}>Location</Text>
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, siteDetails.isIndoor && styles.segmentActive]}
              onPress={() => updateSiteDetails({ isIndoor: true })}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={14} color={siteDetails.isIndoor ? Colors.textWhite : Colors.textSecondary} />
              <Text style={[styles.segmentText, siteDetails.isIndoor && styles.segmentTextActive]}>Indoor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, !siteDetails.isIndoor && styles.segmentActive]}
              onPress={() => updateSiteDetails({ isIndoor: false })}
              activeOpacity={0.8}
            >
              <Ionicons name="sunny-outline" size={14} color={!siteDetails.isIndoor ? Colors.textWhite : Colors.textSecondary} />
              <Text style={[styles.segmentText, !siteDetails.isIndoor && styles.segmentTextActive]}>Outdoor</Text>
            </TouchableOpacity>
          </View>

          {siteDetails.isIndoor && (
            <TouchableOpacity style={styles.checkRow} onPress={() => updateSiteDetails({ roomSizeConfirmed: !siteDetails.roomSizeConfirmed })} activeOpacity={0.7}>
              <View style={[styles.checkbox, siteDetails.roomSizeConfirmed && styles.checkboxChecked]}>
                {siteDetails.roomSizeConfirmed && <Ionicons name="checkmark" size={12} color={Colors.textWhite} />}
              </View>
              <View style={styles.checkTextCol}>
                <Text style={styles.checkLabel}>Room size ≥ 2,200 ft³ confirmed</Text>
                {!siteDetails.roomSizeConfirmed && <Text style={styles.checkWarning}>⚠️ Required to continue</Text>}
              </View>
            </TouchableOpacity>
          )}

          {!siteDetails.isIndoor && (
            <TouchableOpacity style={styles.checkRow} onPress={() => updateSiteDetails({ rainProtectedConfirmed: !siteDetails.rainProtectedConfirmed })} activeOpacity={0.7}>
              <View style={[styles.checkbox, siteDetails.rainProtectedConfirmed && styles.checkboxChecked]}>
                {siteDetails.rainProtectedConfirmed && <Ionicons name="checkmark" size={12} color={Colors.textWhite} />}
              </View>
              <View style={styles.checkTextCol}>
                <Text style={styles.checkLabel}>Rain protected location confirmed</Text>
                {!siteDetails.rainProtectedConfirmed && <Text style={styles.checkWarning}>⚠️ Required to continue</Text>}
              </View>
            </TouchableOpacity>
          )}

          <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>System Type</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>{siteDetails.systemType}</Text>
            <Ionicons name="lock-closed-outline" size={13} color={Colors.textMuted} />
          </View>

          {/* ── Notes ── */}
          <Text style={styles.sectionHeader}>Notes</Text>
          <TextInput
            style={styles.inputNotes}
            value={siteDetails.notes}
            onChangeText={(v) => updateSiteDetails({ notes: v })}
            placeholder="Optional notes for this installation"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />

          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky CTA */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.ctaBtn, !isValid && styles.ctaBtnDisabled]}
            onPress={() => { if (isValid) router.push('/procedure-selection'); }}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>Start Installation</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  headerSafe: { backgroundColor: Colors.headerBg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 12,
    paddingBottom: 8,
    gap: 3,
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 26,
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: 5,
    marginBottom: 2,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  required: { color: Colors.danger },

  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.danger },
  inputNotes: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 58,
  },
  inputDisabled: {
    backgroundColor: Colors.divider,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDisabledText: { fontSize: 14, color: Colors.textSecondary },

  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 9,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    gap: 5,
  },
  segmentActive: { backgroundColor: Colors.headerBg },
  segmentText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textWhite, fontWeight: '600' },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 3,
    marginTop: 3,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkTextCol: { flex: 1, gap: 1 },
  checkLabel: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  checkWarning: { fontSize: 11, color: Colors.warning },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 9,
    marginTop: 4,
  },
  errorText: { fontSize: 12, color: Colors.danger, flex: 1 },

  bottomBar: {
    backgroundColor: Colors.bodyBg,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 11,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnDisabled: { backgroundColor: Colors.textMuted },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },
});
