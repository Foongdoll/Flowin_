import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, palette, shadows } from "./theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ title, onPress, loading, disabled, style, variant = "primary" }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primaryWrap : variant === "secondary" ? styles.secondaryWrap : styles.dangerWrap,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={gradients.buttonPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.text}>{title}</Text>}
        </LinearGradient>
      ) : variant === "secondary" ? (
        <View style={[styles.fill, styles.secondaryInner]}>
          {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={[styles.text, styles.textSecondary]}>{title}</Text>}
        </View>
      ) : (
        <LinearGradient colors={[palette.danger, "#f97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
          {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.text}>{title}</Text>}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: "hidden",
  },
  fill: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryWrap: {
    ...shadows.glow,
  },
  secondaryWrap: {
    borderWidth: 1,
    borderColor: palette.cardBorder,
    backgroundColor: palette.backgroundAlt,
  },
  dangerWrap: {
    ...shadows.glow,
  },
  secondaryInner: {
    paddingVertical: 16,
  },
  text: {
    color: palette.textPrimary,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  textSecondary: {
    color: palette.textSecondary,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});

