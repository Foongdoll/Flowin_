import { Link, router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { palette } from "../../components/ui/theme";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Screen from "../../components/ui/Screen";
import { useAuth } from "../../components/provider/AuthProvider";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(null);
      await signIn({ email, password });
      router.replace("/(tabs)");
    } catch (error) {
      let message = "로그인에 실패했습니다.";
      if (error instanceof Error) {
        const lower = error.message.toLowerCase();        
        if (lower.includes("password") || lower.includes("credential")) {
          message = "이메일 또는 비밀번호가 올바르지 않습니다.";
        } else if (lower.includes("network")) {
          message = "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          message = error.message;
        }
      }
      setErrorMessage(message);
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

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button title="로그인" onPress={onSignIn} loading={loading} disabled={!isValid} />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>계정이 없으신가요?</Text>
        <Link href="/(auth)/sign-up" style={styles.link}>회원가입</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 12, gap: 6 },
  brand: { fontSize: 30, fontWeight: "900", color: palette.accentAlt, letterSpacing: 1.6, textTransform: "uppercase" },
  subtitle: { color: palette.textSecondary, letterSpacing: 0.4 },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 12 },
  footerText: { color: palette.textSecondary },
  link: { color: palette.accentWarm, fontWeight: "800", letterSpacing: 0.2 },
  error: { color: palette.danger, marginTop: 4, textAlign: "center" },
});
