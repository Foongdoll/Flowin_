import React, { useState } from "react";
import { View, TextInput, StyleSheet, ViewStyle, GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, shadows } from "./theme";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  style?: ViewStyle | ViewStyle[];
};

export default function SearchInput({ value, onChangeText, placeholder = "검색", style }: Props) {
  const [focused, setFocused] = useState(false);

  const stopParentPress = (e: GestureResponderEvent) => {
    // 부모 Pressable 등으로 이벤트 버블링 방지
    (e as any).stopPropagation?.();
  };

  return (
    <View
      style={[styles.wrap, focused && styles.focused, style]}
      onTouchStart={stopParentPress}
      accessible
      accessibilityLabel="검색 입력창"
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={palette.textMuted}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 16,
    backgroundColor: palette.backgroundAlt,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden", // 그림자/포커스 잘리거나 깨지지 않게
  },
  focused: {
    borderColor: palette.accent,
    ...shadows.glow,
  },
  input: {
    flex: 1,
    paddingRight: 18,
    fontSize: 16,
    color: palette.textPrimary,
  },
  icon: {
    marginHorizontal: 12,
  },
});
