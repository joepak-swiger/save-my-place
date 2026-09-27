import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  title: string;
  uri?: string;
  size?: 'card' | 'hero' | 'small';
};

export function Cover({ title, uri, size = 'card' }: Props) {
  const dimensions = size === 'hero' ? styles.hero : size === 'small' ? styles.small : styles.card;

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, dimensions]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.base, dimensions, styles.fallback]}>
      <Text numberOfLines={4} style={styles.fallbackText}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.panel2 },
  card: { width: 112, height: 152, borderRadius: radius.md },
  hero: { width: 150, height: 205, borderRadius: radius.lg },
  small: { width: 72, height: 96, borderRadius: radius.sm },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  fallbackText: { color: colors.text, fontSize: 14, fontWeight: '900', textAlign: 'center' }
});
