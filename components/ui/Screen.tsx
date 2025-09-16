import React from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, palette, shadows } from "./theme";

type Props = {
  children: React.ReactNode;
  centered?: boolean;
  contentStyle?: ViewStyle | ViewStyle[];
  scroll?: boolean;
};

export default function Screen({ children, centered = false, contentStyle, scroll = true }: Props) {
  return (
    <LinearGradient colors={gradients.screen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="always"
              contentContainerStyle={[styles.content, centered && styles.centered, contentStyle]}
            >
              <View style={styles.surface}>{children}</View>
            </ScrollView>
          ) : (
            <View style={[styles.content, centered && styles.centered, contentStyle]}>
              <View style={styles.surface}>{children}</View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, alignItems: "center" },
  centered: { justifyContent: "center" },
  surface: {
    width: "100%",
    maxWidth: 460,
    gap: 18,
    padding: 26,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    backgroundColor: palette.card,
    ...shadows.glow,
  },
});
