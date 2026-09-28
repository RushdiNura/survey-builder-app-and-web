import React, { useRef } from "react";
import { Animated, Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";

const VARIANTS = ["primary", "secondary", "ghost", "danger"];
const SIZES = { sm: { padV: 9, padH: 14, font: 13 }, md: { padV: 13, padH: 18, font: 15 } };

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  style,
}) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const dims = SIZES[size] || SIZES.md;

  const palette = {
    primary: { bg: theme.colors.primary, bgPressed: theme.colors.primaryPressed, text: "#FFFFFF", border: "transparent" },
    secondary: { bg: theme.colors.surface, bgPressed: theme.colors.surfaceAlt, text: theme.colors.text, border: theme.colors.border },
    ghost: { bg: "transparent", bgPressed: theme.colors.surfaceAlt, text: theme.colors.textMuted, border: "transparent" },
    danger: { bg: "transparent", bgPressed: theme.colors.dangerTint, text: theme.colors.danger, border: theme.colors.danger },
  }[VARIANTS.includes(variant) ? variant : "primary"];

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  }
  function handlePress() {
    if (isDisabled) return;
    Haptics.impactAsync(hapticStyle).catch(() => {});
    onPress?.();
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { width: "100%" }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderWidth: variant === "secondary" || variant === "danger" ? 1 : 0,
            paddingVertical: dims.padV,
            paddingHorizontal: dims.padH,
            opacity: isDisabled ? 0.55 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={palette.text} />
        ) : (
          <>
            {Icon && <Icon size={dims.font + 3} color={palette.text} />}
            <Text style={{ color: palette.text, fontFamily: theme.typography.fontFamily.semibold, fontSize: dims.font }}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
  },
});
