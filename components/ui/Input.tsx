import { Ionicons } from "@expo/vector-icons";
import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { palette, shadows } from "./theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  secureToggle?: boolean;
};

const Input = React.forwardRef<TextInput, Props>(function Input(
  { label, error, helper, leftIcon, rightIcon, secureTextEntry, secureToggle, style, ...rest }: Props,
  ref
) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(!!secureTextEntry);
  const innerRef = useRef<TextInput>(null);
  useImperativeHandle(ref, () => innerRef.current!);

  const computedBlurOnSubmit = useMemo(() => {
    if (typeof rest.blurOnSubmit === "boolean") return rest.blurOnSubmit;
    return rest.returnKeyType === "next" ? false : true;
  }, [rest.blurOnSubmit, rest.returnKeyType]);

  const { placeholderTextColor = palette.textMuted, ...inputProps } = rest;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => innerRef.current?.focus()}
        style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={palette.textMuted} style={styles.iconLeft} />
        ) : null}

        <TextInput
          ref={innerRef}
          {...inputProps}
          blurOnSubmit={computedBlurOnSubmit}
          style={[styles.input, style]}
          secureTextEntry={secure}
          placeholderTextColor={placeholderTextColor}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />

        {secureToggle ? (
          <Pressable onPress={() => { setSecure((s) => !s); innerRef.current?.focus(); }} hitSlop={10}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={palette.textMuted}
              style={styles.iconRight}
            />
          </Pressable>
        ) : rightIcon ? (
          <Ionicons name={rightIcon} size={18} color={palette.textMuted} style={styles.iconRight} />
        ) : null}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, color: palette.textSecondary, fontWeight: "700", letterSpacing: 0.2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.cardBorder,
    borderRadius: 14,
    backgroundColor: palette.backgroundAlt,
    overflow: "hidden",
  },
  fieldFocused: {
    borderColor: palette.accent,
    ...shadows.glow,
  },
  fieldError: { borderColor: palette.danger },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: palette.textPrimary },
  iconLeft: { marginLeft: 12 },
  iconRight: { marginRight: 12 },
  helper: { color: palette.textMuted, fontSize: 12 },
  error: { color: palette.danger, fontSize: 12 },
});
