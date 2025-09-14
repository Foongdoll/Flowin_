import { Link, router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Screen from "../../components/ui/Screen";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const errors = {
    email: !emailOk ? "올바른 이메일을 입력하세요." : undefined,
    password: password.length < 6 ? "비밀번호는 6자 이상입니다." : undefined,
  } as const;
  const isValid = !errors.email && !errors.password;

  const onSignIn = async () => {
    setSubmitted(true);
    if (!isValid || loading) return;
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen centered scroll={false}>
      <View style={styles.header}>
        <Text style={styles.brand}>Flowin</Text>
        <Text style={styles.subtitle}>로그인하고 계속하기</Text>
      </View>

      {/* 이메일 */}
      <Input
        label="이메일"
        placeholder="you@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        error={(touched.email || submitted) ? errors.email : undefined}
        leftIcon="mail-outline"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      {/* 비밀번호 */}
      <Input
        label="비밀번호"
        placeholder="비밀번호"
        secureTextEntry
        secureToggle
        autoCorrect={false}
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        onBlur={() => setTouched(t => ({ ...t, password: true }))}
        // 👇 여기서는 더 이상 필요 없음
        // blurOnSubmit={false}
        error={(touched.password || submitted) ? errors.password : undefined}
        leftIcon="lock-closed-outline"
        textContentType="password"
        returnKeyType="done"
        ref={passwordRef}
        onSubmitEditing={onSignIn}
      />

      <Button title="로그인" onPress={onSignIn} loading={loading} disabled={!isValid} />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>계정이 없으신가요?</Text>
        <Link href="/(auth)/sign-up" style={styles.link}>회원가입</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 8 },
  brand: { fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#6b7280" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 6 },
  footerText: { color: "#6b7280" },
  link: { color: "#2563eb", fontWeight: "700" },
});
