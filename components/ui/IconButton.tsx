import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "./theme";

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  background?: string;
};

export default function IconButton({ name, size = 20, color = palette.textPrimary, onPress, style, disabled, background }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background ?? palette.backgroundAlt },
        disabled && { opacity: 0.5 },
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },
  pressed: { transform: [{ scale: 0.95 }] },
});
