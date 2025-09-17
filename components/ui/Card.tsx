import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, palette, shadows } from "./theme";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Card({ title, subtitle, icon, onPress, style }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const animatedStyle = {
    transform: [
      {
        scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }),
      },
    ],
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
    >
      <Animated.View style={[styles.animated, animatedStyle]}>
        <AnimatedGradient colors={gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.row}>
            {icon ? (
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={22} color={palette.textPrimary} />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
          </View>
        </AnimatedGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    overflow: "hidden",
    ...shadows.glow,
  },
  animated: { borderRadius: 18 },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    backgroundColor: palette.card,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.35)",
    borderWidth: 1,
    borderColor: palette.cardBorder,
  },
  title: { fontSize: 16, fontWeight: "800", color: palette.textPrimary, letterSpacing: 0.2 },
  subtitle: { color: palette.textSecondary, marginTop: 4, fontSize: 12 },
});
