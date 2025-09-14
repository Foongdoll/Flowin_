import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import IconButton from "./IconButton";

type Props = {
  title: string;
  subtitle?: string;
  leftIcon?: Parameters<typeof IconButton>[0]["name"];
  onLeftPress?: () => void;
  rightIcon?: Parameters<typeof IconButton>[0]["name"];
  onRightPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export default function HeaderBar({ title, subtitle, leftIcon, onLeftPress, rightIcon, onRightPress, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {leftIcon ? <IconButton name={leftIcon} onPress={onLeftPress} /> : <View style={{ width: 36 }} />}
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.side}>
        {rightIcon ? <IconButton name={rightIcon} onPress={onRightPress} /> : <View style={{ width: 36 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  side: { width: 56, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 12, color: "#6b7280" },
});

