import React, { useState } from "react";
import { View, TextInput, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      <Ionicons name="search-outline" size={18} color="#6b7280" style={{ marginHorizontal: 10 }} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
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
    height: 42,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  focused: { borderColor: "#2563eb" },
  input: { flex: 1, paddingRight: 12, fontSize: 16 },
});

