import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, shadows } from "./theme";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function ListItem({ title, subtitle, onPress, onLongPress, right, style }: Props) {
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 4200, useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 4200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);

  const translate = shine.interpolate({ inputRange: [0, 1], outputRange: [-80, 220] });
  const opacity = shine.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={260}
      style={({ pressed }) => [styles.item, pressed && styles.pressed, style]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />}
      <Animated.View style={[styles.shine, { transform: [{ translateX: translate }], opacity }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 16,
    backgroundColor: palette.backgroundAlt,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadows.soft,
    overflow: "hidden",
  },
  pressed: { transform: [{ scale: 0.99 }] },
  title: { fontSize: 15, fontWeight: "700", color: palette.textPrimary, letterSpacing: 0.2 },
  subtitle: { fontSize: 12, color: palette.textSecondary, marginTop: 2 },
  shine: {
    position: "absolute",
    top: -4,
    bottom: -4,
    width: 60,
    backgroundColor: "rgba(77, 210, 255, 0.35)",
    transform: [{ rotate: "12deg" }],
    pointerEvents: "none",
  },
});
