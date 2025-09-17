import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type OrbConfig = {
  key: string;
  size: number;
  color: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
};

const { width, height } = Dimensions.get("window");

const AnimatedView = Animated.createAnimatedComponent(View);

export default function AmbientBackdrop() {
  const orbs = useMemo<OrbConfig[]>(
    () => [
      {
        key: "orb-1",
        size: Math.max(width, height) * 0.6,
        color: "rgba(124,92,255,0.24)",
        start: { x: -width * 0.25, y: -height * 0.3 },
        end: { x: width * 0.1, y: -height * 0.1 },
        duration: 14000,
      },
      {
        key: "orb-2",
        size: Math.max(width, height) * 0.45,
        color: "rgba(76,201,240,0.18)",
        start: { x: width * 0.65, y: height * 0.2 },
        end: { x: width * 0.4, y: height * 0.38 },
        duration: 12000,
      },
      {
        key: "orb-3",
        size: Math.max(width, height) * 0.5,
        color: "rgba(249,168,212,0.20)",
        start: { x: width * 0.15, y: height * 0.6 },
        end: { x: width * 0.05, y: height * 0.45 },
        duration: 16000,
      },
    ],
    []
  );

  const values = useRef(orbs.map(() => new Animated.Value(0))).current;
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration: orbs[index].duration, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: orbs[index].duration, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((anim) => anim.start());

    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ])
    );
    scanLoop.start();

    return () => {
      animations.forEach((anim) => anim.stop());
      scanLoop.stop();
    };
  }, [orbs, values, scan]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {orbs.map((orb, index) => {
        const animatedStyle = {
          transform: [
            {
              translateX: values[index].interpolate({
                inputRange: [0, 1],
                outputRange: [orb.start.x, orb.end.x],
              }),
            },
            {
              translateY: values[index].interpolate({
                inputRange: [0, 1],
                outputRange: [orb.start.y, orb.end.y],
              }),
            },
            {
              scale: values[index].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.12],
              }),
            },
          ],
          opacity: values[index].interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] }),
        };
        return <AnimatedView key={orb.key} style={[styles.orb, animatedStyle, { width: orb.size, height: orb.size, backgroundColor: orb.color }]} />;
      })}
      <AnimatedView
        style={[
          styles.scanline,
          {
            transform: [
              {
                translateY: scan.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-height * 0.4, height * 0.6],
                }),
              },
            ],
            opacity: scan.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.18, 0] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 9999,
    shadowColor: "rgba(10, 12, 30, 0.6)",
    shadowOpacity: 0.6,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "rgba(77, 210, 255, 0.28)",
  },
});
