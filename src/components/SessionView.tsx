import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SessionType } from '../types';

interface SessionViewProps {
  sessionType: SessionType;
}

export default function SessionView({ sessionType }: SessionViewProps) {
  const isVideo = sessionType === 'VIDEO';

  return (
    <View style={[styles.container, isVideo ? styles.videoContainer : styles.voiceContainer]}>
      <Text variant="displaySmall" style={styles.text}>
        {isVideo ? '🎥 Video Session Active' : '🎤 Voice Session Active'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  videoContainer: {
    backgroundColor: '#1E3A8A',
  },
  voiceContainer: {
    backgroundColor: '#581C87',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
