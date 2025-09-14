import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function ListItem({ title, subtitle, onPress, right, style }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={16} color="#9ca3af" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { padding: 14, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", gap: 10 },
  pressed: { backgroundColor: "#f9fafb" },
  title: { fontSize: 15, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});

