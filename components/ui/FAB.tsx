import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, palette, shadows } from "./theme";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function FAB({ icon = "add", label, onPress, style }: Props) {
  const insets = useSafeAreaInsets();
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 3600, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 3600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const animatedStyle = {
    transform: [
      {
        translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
      },
    ],
  };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: 18 + Math.max(insets.bottom, 10) },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <AnimatedGradient colors={gradients.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.inner, animatedStyle]}>
        <Ionicons name={icon} size={20} color={palette.textPrimary} />
        {label ? <Text style={styles.text}>{label}</Text> : null}
      </AnimatedGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    borderRadius: 26,
    ...shadows.glow,
  },
  inner: {
    borderRadius: 26,
    height: 52,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  text: { color: palette.textPrimary, fontWeight: "800", letterSpacing: 0.6 },
});
