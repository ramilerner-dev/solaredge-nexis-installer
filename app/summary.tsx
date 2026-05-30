import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/Colors';

export default function SummaryScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppHeader title="Installation Summary" showBack />
      <View style={styles.body}>
        <Text style={styles.placeholder}>Summary Screen — coming in Phase 6</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')}>
          <Text style={styles.btnText}>← Back to Home</Text>
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
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
