import { Ionicons } from "@expo/vector-icons";
import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

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

  // ✅ returnKeyType에 따른 blurOnSubmit 기본값 자동화
  const computedBlurOnSubmit = useMemo(() => {
    if (typeof rest.blurOnSubmit === "boolean") return rest.blurOnSubmit;
    return rest.returnKeyType === "next" ? false : true;
  }, [rest.blurOnSubmit, rest.returnKeyType]);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => innerRef.current?.focus()}
        style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color="#6b7280" style={styles.iconLeft} />
        ) : null}

        <TextInput
          ref={innerRef}
          {...rest}          
          blurOnSubmit={computedBlurOnSubmit}
          style={[styles.input, style]}
          secureTextEntry={secure}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />

        {secureToggle ? (
          <Pressable onPress={() => { setSecure((s) => !s); innerRef.current?.focus(); }} hitSlop={10}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#6b7280"
              style={styles.iconRight}
            />
          </Pressable>
        ) : rightIcon ? (
          <Ionicons name={rightIcon} size={18} color="#6b7280" style={styles.iconRight} />
        ) : null}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, color: "#374151", fontWeight: "600" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  fieldFocused: {
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fieldError: { borderColor: "#ef4444" },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  iconLeft: { marginLeft: 10 },
  iconRight: { marginRight: 10 },
  helper: { color: "#6b7280", fontSize: 12 },
  error: { color: "#ef4444", fontSize: 12 },
});
