import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export default function Card({ title, subtitle, icon, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}> 
      <View style={styles.row}>
        {icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={22} color="#111827" />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" },
  pressed: { backgroundColor: "#f9fafb" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  subtitle: { color: "#6b7280", marginTop: 2 },
});

