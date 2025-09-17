import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { useBoard } from "../../../components/provider/BoardProvider";
import { palette } from "../../../components/ui/theme";

export default function BoardIndex() {
  const { posts, categories, loading, error, refresh } = useBoard();
  const [cat, setCat] = useState<string>("전체");
  const [q, setQ] = useState("");
  const normalized = q.trim();

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(cat)) {
      setCat(categories[0]);
    }
  }, [categories, cat]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh({ q: normalized, category: cat });
    }, 250);
    return () => clearTimeout(timer);
  }, [normalized, cat, refresh]);

  const list = useMemo(() => posts, [posts]);
  const emptyMessage = error || (loading ? "게시글을 불러오는 중입니다..." : "게시글이 없습니다.");
  const renderEmpty = useCallback(() => <Text style={styles.empty}>{emptyMessage}</Text>, [emptyMessage]);

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
          data={list}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => {
            const subtitle = `[${item.category}] ${item.authorName || "익명"} · ${formatRelative(item.createdAt)}`;
            return (
              <ListItem
                title={item.title}
                subtitle={subtitle}
                onPress={() => router.push({ pathname: "/(tabs)/board/[id]", params: { id: item.id } })}
              />
            );
          }}
          extraData={emptyMessage}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
          refreshing={loading}
          onRefresh={() => refresh({ q: normalized, category: cat })}
        />
      </View>
      <FAB label="글쓰기" icon="create-outline" onPress={() => router.push("/(tabs)/board/new" as any)} />
    </View>
  );
}

function formatRelative(iso: string) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return iso;
  const diff = Date.now() - time;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return m + "분 전";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "시간 전";
  const d = Math.floor(h / 24);
  return d + "일 전";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  body: { padding: 20, gap: 16 },
  catRow: { gap: 10, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: palette.cardBorder, backgroundColor: "rgba(148,163,184,0.1)" },
  chipActive: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.textSecondary, fontWeight: "700" },
  chipTextActive: { color: palette.textPrimary },
  empty: { textAlign: "center", color: palette.textMuted, paddingVertical: 32 },
});
