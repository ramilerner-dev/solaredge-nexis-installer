import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = Math.round(SCREEN_WIDTH * 0.78);

export default function JpegFullscreenModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modal}>
        <SafeAreaView edges={['top']} style={styles.safe}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={28} color={Colors.textWhite} />
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.body}>
          <View style={styles.frame}>
            <Text style={styles.label}>JPEG</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: '#000' },
  safe: { backgroundColor: '#000' },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderStyle: 'dashed',
    borderRadius: 6,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 48,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 6,
  },
});
