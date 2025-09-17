import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import IconButton from "./IconButton";
import { gradients, palette, shadows } from "./theme";

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
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-80, 120] });

  return (
    <LinearGradient colors={gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.container, style]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX: translate }] }]} pointerEvents="none" />
      <View style={styles.side}>
        {leftIcon ? <IconButton name={leftIcon} onPress={onLeftPress} /> : <View style={{ width: 40 }} />}
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.side}>
        {rightIcon ? <IconButton name={rightIcon} onPress={onRightPress} /> : <View style={{ width: 40 }} />}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: palette.cardBorder,
    paddingHorizontal: 12,
    backgroundColor: palette.backgroundAlt,
    ...shadows.glow,
  },
  side: { width: 64, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "900", color: palette.textPrimary, letterSpacing: 0.5, textTransform: "uppercase" },
  subtitle: { fontSize: 12, color: palette.textSecondary, marginTop: 4, letterSpacing: 1 },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "rgba(77,210,255,0.18)",
    transform: [{ rotate: "12deg" }],
  },
});
