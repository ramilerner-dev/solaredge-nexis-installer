import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';

export default function StepScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppHeader title="Step 1 of 12" showExit onExit={() => router.push('/summary')} />
      <View style={styles.body}>
        <Text style={styles.placeholder}>Step-by-Step Installation — coming in Phase 5</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/summary')}>
          <Text style={styles.btnText}>Go to Summary →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => router.push('/test-steps')}>
          <Text style={styles.btnText}>Phase 4 Image Test →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bodyBg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  placeholder: { fontSize: 16, color: Colors.textSecondary },
  btn: { backgroundColor: Colors.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  btnSecondary: { backgroundColor: Colors.headerBg },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
