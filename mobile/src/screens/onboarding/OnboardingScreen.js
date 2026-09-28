import React, { useRef, useState } from "react";
import { View, Text, FlatList, Animated, useWindowDimensions, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ClipboardList, BarChart3, Share2 } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import Button from "../../components/Button";

const SLIDES = [
  {
    icon: ClipboardList,
    title: "Build surveys in minutes",
    body: "Nine question types, scheduling, and a builder that feels as fast as typing a note.",
  },
  {
    icon: Share2,
    title: "Share anywhere",
    body: "Copy a link, use the native share sheet, or send email invitations in a couple of taps.",
  },
  {
    icon: BarChart3,
    title: "Watch responses roll in",
    body: "Live analytics update the moment someone responds — no refreshing, no waiting.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      onDone();
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={onDone} hitSlop={10}>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 }}>
            Skip
          </Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: "center", paddingHorizontal: 32 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryTint }]}>
              <item.icon size={40} color={theme.colors.primary} strokeWidth={1.6} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {item.title}
            </Text>
            <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 22, 8], extrapolate: "clamp" });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor: theme.colors.primary }]}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          title={index === SLIDES.length - 1 ? "Get started" : "Next"}
          onPress={handleNext}
          fullWidth
          size="md"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 8 },
  iconWrap: { width: 92, height: 92, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  title: { fontSize: 22, textAlign: "center", marginBottom: 12 },
  body: { fontSize: 14.5, textAlign: "center", lineHeight: 21, maxWidth: 300 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 },
});
