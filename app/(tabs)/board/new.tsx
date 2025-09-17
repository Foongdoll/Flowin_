import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Pressable, Text } from "react-native";
import { router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useBoard } from "../../../components/provider/BoardProvider";
import { useAuth } from "../../../components/provider/AuthProvider";
import { palette } from "../../../components/ui/theme";

export default function NewPost() {
  const { add, categories } = useBoard();
  const { user } = useAuth();
  const defaultCategory = useMemo(() => {
    const first = categories.find((c) => c !== "전체");
    return first || categories[0] || "자유";
  }, [categories]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(user?.name || "");
  const [category, setCategory] = useState(defaultCategory);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const errors = {
    title: !title.trim() ? "제목을 입력하세요." : undefined,
    content: !content.trim() ? "내용을 입력하세요." : undefined,
  } as const;
  const isValid = !errors.title && !errors.content;

  const onSave = async () => {
    setSubmitted(true);
    if (!isValid || saving) return;
    try {
      setSaving(true);
      const created = await add({ title: title.trim(), content: content.trim(), category, authorName: authorName.trim() || undefined });
      Alert.alert("게시 완료", "게시글이 등록되었습니다.");
      router.replace({ pathname: "/(tabs)/board/[id]", params: { id: created.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "게시글을 등록하지 못했습니다.";
      Alert.alert("오류", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="글쓰기" leftIcon="chevron-back" onLeftPress={() => router.back()} />
      <View style={styles.form}>
        <View style={{ gap: 8 }}>
          <Text style={styles.label}>카테고리</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories
              .filter((c) => c !== "전체")
              .map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            {categories.every((c) => c === "전체") ? (
              <Pressable onPress={() => setCategory("자유")} style={[styles.chip, category === "자유" && styles.chipActive]}>
                <Text style={[styles.chipText, category === "자유" && styles.chipTextActive]}>자유</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
        <Input label="제목" placeholder="제목을 입력하세요" value={title} onChangeText={setTitle} error={submitted ? errors.title : undefined} />
        <Input label="작성자" placeholder="닉네임" value={authorName} onChangeText={setAuthorName} />
        <Input label="내용" placeholder="본문" value={content} onChangeText={setContent} multiline style={{ minHeight: 160 }} textAlignVertical="top" error={submitted ? errors.content : undefined} />
        <Button title={saving ? "등록 중..." : "등록"} onPress={onSave} disabled={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  form: { padding: 20, gap: 16 },
  label: { fontSize: 14, color: palette.textSecondary, fontWeight: "700" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: palette.cardBorder, backgroundColor: "rgba(148,163,184,0.1)" },
  chipActive: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.textSecondary, fontWeight: "700" },
  chipTextActive: { color: palette.textPrimary },
});
