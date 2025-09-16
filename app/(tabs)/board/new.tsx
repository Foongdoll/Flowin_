import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Pressable, Text } from "react-native";
import HeaderBar from "../../../components/ui/HeaderBar";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useBoard } from "../../../components/provider/BoardProvider";
import { router } from "expo-router";
import { palette } from "../../../components/ui/theme";

export default function NewPost() {
  const { add, categories } = useBoard();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("홍길동");
  const [category, setCategory] = useState(categories[1]);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    title: !title.trim() ? "제목을 입력하세요." : undefined,
    content: !content.trim() ? "내용을 입력하세요." : undefined,
  } as const;
  const isValid = !errors.title && !errors.content;

  const onSave = () => {
    setSubmitted(true);
    if (!isValid) return;
    const id = add({ title, content, author, category });
    Alert.alert("게시 완료", "게시글이 등록되었습니다.");
    router.replace({ pathname: "/(tabs)/board/[id]", params: { id } });
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="글쓰기" leftIcon="chevron-back" onLeftPress={() => router.back()} />
      <View style={styles.form}>
        <View style={{ gap: 8 }}>
          <Text style={styles.label}>카테고리</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories.filter((c) => c !== "전체").map((c) => (
              <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Input label="제목" placeholder="제목을 입력하세요" value={title} onChangeText={setTitle} error={submitted ? errors.title : undefined} />
        <Input label="작성자" placeholder="닉네임" value={author} onChangeText={setAuthor} />
        <Input label="내용" placeholder="본문" value={content} onChangeText={setContent} multiline style={{ minHeight: 160 }} textAlignVertical="top" error={submitted ? errors.content : undefined} />
        <Button title="등록" onPress={onSave} />
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
