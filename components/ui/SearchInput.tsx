import React, { useState } from "react";
import { View, TextInput, StyleSheet, ViewStyle } from "react-native";
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
  return (
    <View style={[styles.wrap, focused && styles.focused, style]}>
      <Ionicons name="search-outline" size={18} color={palette.textMuted} style={{ marginHorizontal: 12 }} />
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
  },
  focused: {
    borderColor: palette.accent,
    ...shadows.glow,
  },
  input: { flex: 1, paddingRight: 18, fontSize: 16, color: palette.textPrimary },
});
