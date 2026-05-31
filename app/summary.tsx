import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useInstallation, type SiteDetails, type StepState } from '@/context/InstallationContext';
import STEPS, { type Step } from '@/data/steps';
import { storageEstimate, formatTimestamp } from '@/utils/validation';
import { totalPhotos, completedCount } from '@/utils/stepUtils';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSummaryHtml(args: {
  siteDetails: SiteDetails;
  steps: StepState[];
  stepData: Step[];
  completed: number;
  totalSteps: number;
  photosTotal: number;
  storage: string;
}): string {
  const { siteDetails, steps, stepData, completed, totalSteps, photosTotal, storage } = args;
  const generated = formatTimestamp(new Date().toISOString());
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const progressPct = Math.round((completed / totalSteps) * 100);

  const stepRowsHtml = stepData
    .map((step, i) => {
      const s = steps[i];
      const isComplete = s?.status === 'complete';
      const photoCount = s?.photoCount ?? 0;
      const time = isComplete ? formatTimestamp(s.completedAt) : '';
      const photosHtml = photoCount > 0
        ? `<div class="photos">${Array.from({ length: photoCount })
            .map(() => `<div class="photo">JPEG</div>`)
            .join('')}</div>`
        : '';
      return `
        <div class="step ${isComplete ? 'done' : 'pending'}">
          <div class="step-row">
            <div class="mark">${isComplete ? '✓' : '○'}</div>
            <div class="step-title">Step ${step.id}: ${escapeHtml(step.title)}</div>
            <div class="step-time">${escapeHtml(time)}</div>
          </div>
          ${photosHtml}
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 0; font-size: 12px; }
  h1 { margin: 0; font-size: 18px; color: #ffffff; }
  .header { background: #0D1B2A; color: #fff; padding: 14px 16px; border-radius: 8px; margin-bottom: 14px; }
  .subhead { color: #cbd5e1; font-size: 11px; margin-top: 2px; }
  .card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; background: #fff; page-break-inside: avoid; }
  .card-label { font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .site-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px; }
  .site-detail { font-size: 12px; color: #6B7280; line-height: 1.4; }
  .progress-count { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px; }
  .progress-track { height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 6px; background: #E63127; border-radius: 3px; }
  .photo-row { font-size: 11px; color: #6B7280; margin-top: 8px; }
  .step { padding: 8px 0; border-bottom: 1px solid #F3F4F6; page-break-inside: avoid; }
  .step:last-child { border-bottom: none; }
  .step-row { display: flex; align-items: center; gap: 10px; }
  .mark { width: 18px; text-align: center; font-size: 14px; font-weight: 700; }
  .step.done .mark { color: #16A34A; }
  .step.pending .mark { color: #9CA3AF; }
  .step-title { flex: 1; font-size: 12px; font-weight: 600; color: #111827; }
  .step.pending .step-title { color: #6B7280; font-weight: 500; }
  .step-time { font-size: 11px; color: #9CA3AF; font-weight: 500; }
  .photos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; margin-left: 28px; }
  .photo {
    width: 64px; height: 48px;
    border: 1px dashed #9CA3AF;
    background: #F3F4F6;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #6B7280; letter-spacing: 1px;
  }
  .notes-block { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #E5E7EB; }
  .notes-label { font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .notes-body { font-size: 12px; color: #111827; line-height: 1.5; white-space: pre-wrap; }
  .footer { margin-top: 16px; font-size: 10px; color: #9CA3AF; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>SolarEdge Nexis — Installation Summary</h1>
    <div class="subhead">Generated ${escapeHtml(today)} at ${escapeHtml(generated)}</div>
  </div>

  <div class="card">
    <div class="card-label">Installation Site</div>
    <div class="site-name">${escapeHtml(siteDetails.siteName)}</div>
    <div class="site-detail">${escapeHtml(siteDetails.customerName)}</div>
    <div class="site-detail">${escapeHtml(siteDetails.address)}</div>
    ${siteDetails.notes.trim() ? `
      <div class="notes-block">
        <div class="notes-label">Notes</div>
        <div class="notes-body">${escapeHtml(siteDetails.notes)}</div>
      </div>
    ` : ''}
  </div>

  <div class="card">
    <div class="card-label">Progress</div>
    <div class="progress-count">${completed} of ${totalSteps} steps completed (${progressPct}%)</div>
    <div class="progress-track"><div class="progress-fill" style="width: ${progressPct}%"></div></div>
    <div class="photo-row">${photosTotal} ${photosTotal === 1 ? 'photo' : 'photos'} · ${escapeHtml(storage)}</div>
  </div>

  <div class="card">
    <div class="card-label">Steps</div>
    ${stepRowsHtml}
  </div>

  <div class="footer">Installer: ${escapeHtml(siteDetails.installerName)} · SolarEdge Nexis 3ph</div>
</body>
</html>
  `.trim();
}

export default function SummaryScreen() {
  const router = useRouter();
  const { currentStepIndex, steps, siteDetails, setCurrentStepIndex } = useInstallation();

  const completed = completedCount(steps);
  const totalSteps = steps.length;
  const photosTotal = totalPhotos(steps);
  const storage = storageEstimate(photosTotal);
  const allComplete = completed === totalSteps;
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const handleBackToInstallation = () => {
    const targetIndex = allComplete ? 0 : currentStepIndex;
    setCurrentStepIndex(targetIndex);
    router.replace('/step');
  };

  const handleStepTap = (index: number) => {
    setCurrentStepIndex(index);
    router.replace('/step');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const handleShare = async () => {
    try {
      const html = buildSummaryHtml({
        siteDetails,
        steps,
        stepData: STEPS,
        completed,
        totalSteps,
        photosTotal,
        storage,
      });
      const { base64 } = await Print.printToFileAsync({ html, base64: true });
      if (!base64) {
        throw new Error('PDF generation returned no data');
      }

      const destUri = `${FileSystem.documentDirectory}installation-summary.pdf`;
      await FileSystem.writeAsStringAsync(destUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing unavailable', `PDF saved at: ${destUri}`);
        return;
      }
      await Sharing.shareAsync(destUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Installation Summary',
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      Alert.alert('Share failed', String(err));
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Installation Summary</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Site card */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Ionicons name="location-outline" size={18} color={Colors.accent} />
            <Text style={styles.cardLabel}>Installation Site</Text>
          </View>
          <Text style={styles.siteName}>{siteDetails.siteName}</Text>
          <Text style={styles.siteDetail}>{siteDetails.customerName}</Text>

          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => setNavSheetVisible(true)}
            activeOpacity={0.6}
          >
            <Text style={styles.addressLink}>{siteDetails.address}</Text>
            <Ionicons name="navigate-outline" size={14} color={Colors.accent} />
          </TouchableOpacity>

          {siteDetails.notes.trim().length > 0 && (
            <View style={styles.notesBlock}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesBody}>{siteDetails.notes}</Text>
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
            {completed} of {totalSteps} steps completed
          </Text>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${(completed / totalSteps) * 100}%` as any }]} />
          </View>

          <View style={styles.photoRow}>
            <Ionicons name="camera-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.photoRowText}>
              {photosTotal} {photosTotal === 1 ? 'photo' : 'photos'} · {storage}
            </Text>
          </View>
        </View>

        {/* Steps list card */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Ionicons name="list-outline" size={18} color={Colors.accent} />
            <Text style={styles.cardLabel}>Steps</Text>
          </View>

          {STEPS.map((step, index) => {
            const state = steps[index];
            const isComplete = state?.status === 'complete';
            const photoCount = state?.photoCount ?? 0;
            const isLast = index === STEPS.length - 1;

            return (
              <TouchableOpacity
                key={step.id}
                onPress={() => handleStepTap(index)}
                activeOpacity={0.6}
                style={[styles.stepRow, !isLast && styles.stepRowBorder]}
              >
                <Ionicons
                  name={isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isComplete ? Colors.success : Colors.textMuted}
                />
                <View style={styles.stepRowText}>
                  <Text style={[styles.stepRowTitle, !isComplete && styles.stepRowTitlePending]}>
                    Step {step.id}: {step.title}
                  </Text>
                  {photoCount > 0 && (
                    <View style={styles.stepPhotoBadge}>
                      <Ionicons name="camera" size={11} color={Colors.textSecondary} />
                      <Text style={styles.stepPhotoBadgeText}>{photoCount}</Text>
                    </View>
                  )}
                </View>
                {isComplete && (
                  <Text style={styles.stepTimestamp}>{formatTimestamp(state.completedAt)}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={Colors.textWhite} />
          <Text style={styles.shareBtnText}>Share Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToInstallation} activeOpacity={0.8}>
          <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>
            {allComplete ? 'Review from Step 1' : 'Back to Installation'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome} activeOpacity={0.8}>
          <Ionicons name="home-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.secondaryBtnTextMuted}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navigation app picker */}
      <Modal
        visible={navSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNavSheetVisible(false)}
      >
        <TouchableOpacity
          style={navSheet.overlay}
          activeOpacity={1}
          onPress={() => setNavSheetVisible(false)}
        />
        <View style={navSheet.container}>
          <View style={navSheet.handle} />
          <Text style={navSheet.title}>Open Address in...</Text>
          <Text style={navSheet.subtitle}>{siteDetails.address}</Text>
          <View style={navSheet.divider} />

          <TouchableOpacity
            style={navSheet.option}
            onPress={() => setNavSheetVisible(false)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="google-maps" size={26} color="#34A853" />
            <Text style={navSheet.optionText}>Open in Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={navSheet.option}
            onPress={() => setNavSheetVisible(false)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="waze" size={26} color="#33CCFF" />
            <Text style={navSheet.optionText}>Open in Waze</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={navSheet.cancel}
            onPress={() => setNavSheetVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={navSheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },

  // Header
  headerSafe: { backgroundColor: Colors.headerBg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.headerBg,
  },
  headerSpacer: { width: 44 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.textWhite },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  // Cards
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

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  addressLink: {
    fontSize: 14,
    color: Colors.accent,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

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
  notesBody: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  progressCount: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },

  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  photoRowText: { fontSize: 13, color: Colors.textSecondary },

  // Step rows
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  stepRowText: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepRowTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stepRowTitlePending: { fontWeight: '500', color: Colors.textSecondary },
  stepPhotoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepPhotoBadgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  stepTimestamp: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  // Buttons
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },

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
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  secondaryBtnTextMuted: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});

const navSheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
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
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  optionText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },

  cancel: { paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  cancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
});
