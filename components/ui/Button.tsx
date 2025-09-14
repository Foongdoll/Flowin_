import React from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  variant?: "primary" | "secondary";
};

export default function Button({ title, onPress, loading, disabled, style, variant = "primary" }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        (pressed && !isDisabled) && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, variant === "secondary" && styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#111827",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  textSecondary: {
    color: "#111827",
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});

