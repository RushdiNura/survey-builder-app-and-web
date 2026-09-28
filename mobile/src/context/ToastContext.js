import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CheckCircle2, XCircle, Info } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";

const ToastContext = createContext(null);
const AUTO_DISMISS_MS = 3200;

const VARIANT = {
  success: { icon: CheckCircle2, haptic: Haptics.NotificationFeedbackType.Success },
  error: { icon: XCircle, haptic: Haptics.NotificationFeedbackType.Error },
  info: { icon: Info, haptic: Haptics.NotificationFeedbackType.Warning },
};

export function ToastProvider({ children }) {
  const { theme } = useTheme();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [anim]);

  const showToast = useCallback(
    (message, variant = "info") => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Haptics.notificationAsync(VARIANT[variant]?.haptic || Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setToast({ message, variant });
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
      timeoutRef.current = setTimeout(hide, AUTO_DISMISS_MS);
    },
    [anim, hide]
  );

  const Icon = toast ? VARIANT[toast.variant]?.icon || Info : Info;
  const tint =
    toast?.variant === "success" ? theme.colors.positive : toast?.variant === "error" ? theme.colors.danger : theme.colors.primary;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: anim,
                transform: [
                  { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
                ],
              },
            ]}
          >
            <Icon size={18} color={tint} />
            <Text style={[styles.text, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    marginTop: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { flex: 1, fontSize: 14 },
});
