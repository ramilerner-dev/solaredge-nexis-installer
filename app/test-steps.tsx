// THROWAWAY SCREEN — Phase 4 visual test only. Delete after Phase 4 sign-off.
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';
import STEPS from '@/data/steps';
import DiagramImages from '@/constants/DiagramImages';

export default function TestStepsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <AppHeader title="Phase 4 — Step Data Test" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {STEPS.map((step) => (
          <View key={step.id} style={styles.card}>
            <Text style={styles.stepId}>Step {step.id} of {STEPS.length}</Text>
            <Text style={styles.title}>{step.title}</Text>
            {step.instructions.map((line, i) => (
              <Text key={i} style={styles.instruction}>• {line}</Text>
            ))}
            <Text style={styles.diagramLabel}>
              Primary diagram: {step.diagramFiles[0]}
            </Text>
            <Image
              source={DiagramImages[step.diagramFiles[0]]}
              style={styles.diagram}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bodyBg },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepId: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  instruction: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  diagramLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 8 },
  diagram: { width: '100%', height: 280, marginTop: 4 },
});
