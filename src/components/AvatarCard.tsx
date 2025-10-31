import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Avatar } from '../types';

interface AvatarCardProps {
  avatar: Avatar;
  onStartVideo: () => void;
  onStartVoice: () => void;
}

export default function AvatarCard({ avatar, onStartVideo, onStartVoice }: AvatarCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.name}>
          {avatar.name}
        </Text>
        <Text variant="titleMedium" style={styles.title}>
          {avatar.title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {avatar.description}
        </Text>

        <View style={styles.pricing}>
          <View style={styles.priceRow}>
            <Text variant="labelLarge">Rate:</Text>
            <Text variant="titleMedium" style={styles.price}>
              ${avatar.pricePerMinute.toFixed(2)}/min
            </Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button mode="contained" onPress={onStartVideo} style={styles.button} icon="video">
          Start Video
        </Button>
        <Button
          mode="contained-tonal"
          onPress={onStartVoice}
          style={styles.button}
          icon="microphone"
        >
          Start Voice
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    opacity: 0.8,
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
  },
  pricing: {
    gap: 8,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: '#FF5F00',
    fontWeight: 'bold',
  },
  discount: {
    color: '#FFB833',
    fontStyle: 'italic',
  },
  actions: {
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
