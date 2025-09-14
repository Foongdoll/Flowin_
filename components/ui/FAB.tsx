import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export default function FAB({ icon = "add", label, onPress, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: 16 + Math.max(insets.bottom, 8) },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#111827",
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    minWidth: 140,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  text: { color: "#fff", fontWeight: "700" },
});
