import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { Link, router } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Screen from "../../components/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../components/provider/AuthProvider";
import { palette } from "../../components/ui/theme";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const { signUp } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const pwdRules = useMemo(() => ({
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password]);
  const pwdScore = useMemo(() => Object.values(pwdRules).reduce((a, v) => a + (v ? 1 : 0), 0), [pwdRules]);

  const errors = {
    name: !name.trim() ? "이름을 입력하세요." : undefined,
    email: !emailOk ? "올바른 이메일을 입력하세요." : undefined,
    password: password.length < 8 ? "비밀번호는 8자 이상 권장합니다." : undefined,
    confirm: confirm !== password ? "비밀번호가 일치하지 않습니다." : undefined,
    agree: !agree ? "약관에 동의해주세요." : undefined,
  } as const;

  const isValid = !errors.name && !errors.email && !errors.password && !errors.confirm && !errors.agree;

  const onSignUp = async () => {
    setSubmitted(true);
    if (loading || !isValid) return;
    try {
      setLoading(true);
      setErrorMessage(null);    
      await signUp({ name, email, password });
      router.replace("/(tabs)");
    } catch (error) {
      let message = "회원가입에 실패했습니다.";
      if (error instanceof Error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("email") && lower.includes("exists")) {
          message = "이미 사용 중인 이메일입니다.";
        } else if (lower.includes("password")) {
          message = "비밀번호 조건을 다시 확인해주세요.";
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
    <Screen centered>
      <View style={styles.header}>
        <Text style={styles.brand}>Flowin</Text>
        <Text style={styles.subtitle}>학습을 더 효과적으로</Text>
      </View>

      <Input
        label="이름"
        placeholder="홍길동"
        value={name}
        onChangeText={setName}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={(touched.name || submitted) ? errors.name : undefined}
        leftIcon="person-outline"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <Input
        label="이메일"
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={(touched.email || submitted) ? errors.email : undefined}
        helper={!touched.email ? "로그인에 사용할 이메일" : undefined}
        leftIcon="mail-outline"
        returnKeyType="next"
        ref={emailRef}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <View style={{ gap: 8 }}>
        <Input
          label="비밀번호"
          placeholder="8자 이상, 숫자/특수문자 포함 권장"
          secureTextEntry
          secureToggle
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={(touched.password || submitted) ? errors.password : undefined}
          leftIcon="lock-closed-outline"
          textContentType="password"
          returnKeyType="next"
          ref={passwordRef}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <View style={styles.meterRow}>
          {[0, 1, 2, 3].map((i) => {
            const levels = [palette.danger, palette.warning, palette.success];
            const tier = Math.min(pwdScore, 3);
            const color = tier === 0 ? "rgba(148,163,184,0.35)" : levels[tier - 1];
            const active = i < pwdScore;
            return <View key={i} style={[styles.meterBar, active ? { backgroundColor: color } : null]} />;
          })}
        </View>
        <View style={styles.rulesRow}>
          <Rule ok={pwdRules.length} text="8자+" />
          <Rule ok={pwdRules.number} text="숫자" />
          <Rule ok={pwdRules.upper} text="대문자" />
          <Rule ok={pwdRules.special} text="특수문자" />
        </View>
      </View>

      <Input
        label="비밀번호 확인"
        placeholder="비밀번호 재입력"
        secureTextEntry
        secureToggle
        value={confirm}
        onChangeText={setConfirm}
        onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
        error={(touched.confirm || submitted) ? errors.confirm : undefined}
        leftIcon="lock-closed-outline"
        textContentType="password"
        returnKeyType="done"
        ref={confirmRef}
        onSubmitEditing={onSignUp}
      />

      <Pressable style={styles.agreeRow} onPress={() => setAgree((a) => !a)} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
        <Ionicons name={agree ? "checkbox-outline" : "square-outline"} size={20} color={agree ? palette.accent : palette.textMuted} />
        <Text style={styles.agreeText}>약관 및 개인정보 처리방침 동의</Text>
      </Pressable>
      {(touched.agree || submitted) && errors.agree ? <Text style={styles.error}>{errors.agree}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button title="회원가입" onPress={onSignUp} loading={loading} disabled={!isValid} />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>이미 계정이 있으신가요?</Text>
        <Link href="/(auth)" style={styles.link}>로그인</Link>
      </View>
    </Screen>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.rule}>
      <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={14} color={ok ? palette.success : palette.textMuted} />
      <Text style={[styles.ruleText, ok && { color: palette.success }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 12, gap: 6 },
  brand: { fontSize: 30, fontWeight: "900", color: palette.accentAlt, letterSpacing: 1.6, textTransform: "uppercase" },
  subtitle: { color: palette.textSecondary, letterSpacing: 0.4 },
  meterRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  meterBar: { flex: 1, height: 6, borderRadius: 4, backgroundColor: "rgba(148,163,184,0.25)" },
  rulesRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  rule: { flexDirection: "row", alignItems: "center", gap: 6 },
  ruleText: { color: palette.textSecondary, fontSize: 12 },
  agreeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  agreeText: { color: palette.textSecondary },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 12 },
  footerText: { color: palette.textSecondary },
  link: { color: palette.accentWarm, fontWeight: "800", letterSpacing: 0.2 },
  error: { color: palette.danger, fontSize: 12 },
});
