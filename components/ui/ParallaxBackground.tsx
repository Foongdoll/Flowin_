import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import tokens from '../../theme/tokens';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface ParallaxBackgroundProps {
  children: React.ReactNode;
}

const GRID_SIZE = 32;

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const baseProgress = useSharedValue(0);
  const midProgress = useSharedValue(0);

  const starfield = React.useMemo(() => {
    const dots: { key: string; left: number; top: number; size: number; opacity: number }[] = [];
    for (let y = 0; y < height + GRID_SIZE; y += GRID_SIZE) {
      for (let x = 0; x < width + GRID_SIZE; x += GRID_SIZE) {
        dots.push({
          key: `dot-${x}-${y}`,
          left: x,
          top: y,
          size: Math.random() > 0.7 ? 6 : 4,
          opacity: 0.12 + Math.random() * 0.18,
        });
      }
    }
    return dots;
  }, [width, height]);

  React.useEffect(() => {
    baseProgress.value = withRepeat(
      withTiming(1, {
        duration: 32000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
    midProgress.value = withRepeat(
      withTiming(1, {
        duration: 24000,
        easing: Easing.linear,
      }),
      -1,
      true,
    );
  }, [baseProgress, midProgress]);

  const farLayerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(baseProgress.value, [0, 1], [0, -width * 0.08]),
      },
      {
        translateY: interpolate(baseProgress.value, [0, 1], [0, -height * 0.04]),
      },
    ],
  }));

  const midLayerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(midProgress.value, [0, 1], [0, -width * 0.12]),
      },
      {
        translateY: interpolate(midProgress.value, [0, 1], [0, -height * 0.06]),
      },
    ],
  }));

  const nearLayerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(midProgress.value, [0, 1], [0, -width * 0.18]),
      },
    ],
  }));

  return (
    <View style={styles.root}>
      <AnimatedGradient
        colors={tokens.colors.gradients.sky}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.gradient, farLayerStyle]}
      />
      <Animated.View style={[styles.gridLayer, midLayerStyle]}>
        {starfield.map((dot) => (
          <View
            key={dot.key}
            style={{
              position: 'absolute',
              width: dot.size,
              height: dot.size,
              borderRadius: 2,
              left: dot.left,
              top: dot.top,
              backgroundColor: '#1F2A52',
              opacity: dot.opacity,
            }}
          />
        ))}
      </Animated.View>
      <Animated.View style={[styles.foregroundGlow, nearLayerStyle]}>
        <LinearGradient
          colors={[tokens.colors.overlay, 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  foregroundGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  content: {
    flex: 1,
    zIndex: tokens.zIndex.content,
  },
});
