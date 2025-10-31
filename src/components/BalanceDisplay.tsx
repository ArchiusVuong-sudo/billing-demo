import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Banner } from 'react-native-paper';

interface BalanceDisplayProps {
  totalBalance: number;
  tokensConsumed: number;
  showLowBalanceWarning: boolean;
}

export default function BalanceDisplay({
  totalBalance,
  tokensConsumed,
  showLowBalanceWarning,
}: BalanceDisplayProps) {
  const remainingBalance = totalBalance - tokensConsumed;

  return (
    <View style={styles.container}>
      {showLowBalanceWarning && (
        <Banner visible={true} icon="alert" style={styles.warningBanner}>
          Low balance! Less than 1 minute remaining
        </Banner>
      )}

      <Surface style={styles.balanceCard} elevation={2}>
        <View style={styles.row}>
          <View style={styles.balanceItem}>
            <Text variant="labelMedium" style={styles.label}>
              Total Balance
            </Text>
            <Text variant="headlineSmall" style={styles.value}>
              {totalBalance.toFixed(2)} tokens
            </Text>
          </View>

          <View style={styles.balanceItem}>
            <Text variant="labelMedium" style={styles.label}>
              Consumed
            </Text>
            <Text variant="headlineSmall" style={styles.consumed}>
              {tokensConsumed.toFixed(2)} tokens
            </Text>
          </View>

          <View style={styles.balanceItem}>
            <Text variant="labelMedium" style={styles.label}>
              Remaining
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.value, remainingBalance <= 0 && styles.depleted]}
            >
              {remainingBalance.toFixed(2)} tokens
            </Text>
          </View>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  warningBanner: {
    marginBottom: 16,
    backgroundColor: '#FFB833',
  },
  balanceCard: {
    padding: 20,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    color: '#FF5F00',
    fontWeight: 'bold',
  },
  consumed: {
    color: '#FFB833',
    fontWeight: 'bold',
  },
  depleted: {
    color: '#FF3B30',
  },
});
