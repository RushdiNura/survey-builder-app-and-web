import React from "react";
import { View, Text, Pressable } from "react-native";

// Last line of defense: a render-time crash shows a recoverable screen
// instead of a blank/white app. Uses plain styles (not theme) because it
// must work even if the theme layer itself is what failed.
export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hook point for a crash reporter (Sentry, Bugsnag, etc.)
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#F9FAFB" }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 8 }}>Something went wrong</Text>
        <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 20 }}>
          An unexpected error occurred. Please try again.
        </Text>
        <Pressable
          onPress={() => this.setState({ hasError: false })}
          style={{ backgroundColor: "#4F46E5", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
