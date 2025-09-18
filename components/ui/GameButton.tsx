import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import tokens from '../../theme/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedOverlay = Animated.createAnimatedComponent(Animated.View);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface GameButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  accessibilityHint?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({
  onPress,
  style,
  textStyle,
  children,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);

  const palette = variant === 'primary'
    ? {
        gradient: ['#63D1F8', '#6F8BFF', '#A67CFF'],
        border: 'rgba(140, 200, 255, 0.45)',
        halo: 'rgba(99, 209, 248, 0.4)',
        text: tokens.colors.text.inverse,
      }
    : {
        gradient: ['#FFB6F8', '#FF8BC5', '#FFB56B'],
        border: 'rgba(255, 175, 240, 0.35)',
        halo: 'rgba(255, 169, 226, 0.4)',
        text: tokens.colors.text.inverse,
      };

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );
  }, [shimmer]);

  const buttonStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.35, 0.55]);
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      opacity: disabled ? tokens.opacity.disabled : 1,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: variant === 'primary' ? 0.35 : 0.28,
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-140, 140]),
      },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressed.value, [0, 1], [0.38, 0.65]),
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 1.05]) }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    pressed.value = withSpring(1, tokens.motion.spring.snappy);
    scale.value = withSpring(0.94, tokens.motion.spring.snappy);
  };

  const handlePressOut = () => {
    if (disabled) return;
    pressed.value = withSpring(0, tokens.motion.spring.gentle);
    scale.value = withSpring(1, tokens.motion.spring.bouncy);
  };

  return (
    <AnimatedTouchable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      activeOpacity={0.9}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.base, buttonStyle, { shadowColor: palette.halo, borderColor: palette.border }, style]}
    >
      <AnimatedOverlay style={[styles.halo, haloStyle, { backgroundColor: palette.halo }]} pointerEvents="none" />
      <AnimatedGradient
        colors={['#63D1F8', '#6F8BFF', '#A67CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
        pointerEvents="none"
      />
      <AnimatedOverlay style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
      <Text style={[styles.text, { color: palette.text }, textStyle]}>{children}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(22, 32, 60, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#5DC2F2',
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 18,
    shadowOpacity: 0.35,
    elevation: 8,
  },
  text: {
    color: tokens.colors.text.inverse,
    fontSize: tokens.typography.size.lg,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    transform: [{ rotate: '18deg' }],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: tokens.radii.xl,
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
  },
});
