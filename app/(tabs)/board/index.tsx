import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable } from "react-native";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { useBoard } from "../../../components/provider/BoardProvider";
import { router } from "expo-router";
import { palette } from "../../../components/ui/theme";

export default function BoardIndex() {
  const { posts, categories } = useBoard();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(categories[0]);
  const data = useMemo(() => {
    const list = posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    if (cat === "전체") return list;
    return list.filter((p) => p.category === cat);
  }, [posts, q, cat]);

  return (
    <View style={styles.container}>
      <HeaderBar title="게시판" subtitle="커뮤니티" />
      <View style={styles.body}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={[styles.chip, cat === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, cat === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <SearchInput value={q} onChangeText={setQ} placeholder="게시글 검색" />
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={`[${item.category}] ${item.author} • ${formatRelative(item.createdAt)}`}
              onPress={() => router.push({ pathname: "/(tabs)/board/[id]", params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
        />
      </View>
      <FAB label="글쓰기" icon="create-outline" onPress={() => router.push("/(tabs)/board/new" as any)} />
    </View>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  body: { padding: 20, gap: 16 },
  catRow: { gap: 10, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: palette.cardBorder, backgroundColor: "rgba(148,163,184,0.1)" },
  chipActive: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.textSecondary, fontWeight: "700" },
  chipTextActive: { color: palette.textPrimary },
});
