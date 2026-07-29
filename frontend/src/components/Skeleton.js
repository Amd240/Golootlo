import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../ThemeContext';

// Base shimmering block — animates opacity between two shades to read as a
// loading placeholder without needing any extra native dependencies.
export function SkeletonBlock({ width = '100%', height = 16, borderRadius = 8, style }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: theme.border },
        { opacity },
        style,
      ]}
    />
  );
}

// Mimics a featured/product card — image block + a couple of text lines + price row
export function SkeletonProductCard({ width = 175, imageHeight = 130, style }) {
  const { theme } = useTheme();
  return (
    <View style={[skStyles.card, { width, backgroundColor: theme.card }, style]}>
      <SkeletonBlock width="100%" height={imageHeight} borderRadius={0} />
      <View style={skStyles.body}>
        <SkeletonBlock width="40%" height={9} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="85%" height={13} style={{ marginBottom: 10 }} />
        <View style={skStyles.footerRow}>
          <SkeletonBlock width={50} height={14} />
          <SkeletonBlock width={28} height={28} borderRadius={9} />
        </View>
      </View>
    </View>
  );
}

// A horizontal row of skeleton product cards, for FlatList-style sections
export function SkeletonRow({ count = 3, cardWidth = 175 }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} width={cardWidth} style={{ marginRight: 14 }} />
      ))}
    </View>
  );
}

// A 2-column grid of skeleton product cards, for grid-style listing screens
export function SkeletonGrid({ count = 6 }) {
  return (
    <View style={skStyles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} width="46%" style={{ margin: 6 }} />
      ))}
    </View>
  );
}

const skStyles = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden' },
  body: { padding: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'center' },
});
