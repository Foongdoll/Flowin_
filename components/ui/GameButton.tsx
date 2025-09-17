import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import tokens from '../../theme/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedOverlay = Animated.createAnimatedComponent(Animated.View);

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
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      variant === 'primary'
        ? [tokens.colors.primary, tokens.colors.accent]
        : [tokens.colors.secondary, tokens.colors.primary],
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      opacity: disabled ? tokens.opacity.disabled : 1,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: variant === 'primary' ? 0.4 : 0.25,
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-140, 140]),
      },
    ],
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
      style={[styles.base, buttonStyle, style]}
    >
      <AnimatedOverlay style={[styles.shimmer, shimmerStyle]} />
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.borders.pixel.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...tokens.shadows.glow,
  },
  text: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ rotate: '12deg' }],
  },
});
