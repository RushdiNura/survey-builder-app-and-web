import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function Skeleton({ width = "100%", height = 16, radius = 8, style }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

export function SurveyCardSkeleton() {
  return (
    <Animated.View style={styles.card}>
      <Skeleton width="70%" height={16} />
      <Skeleton width="45%" height={12} style={{ marginTop: 10 }} />
      <Skeleton width="90%" height={12} style={{ marginTop: 14 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 14, marginBottom: 12 },
});
