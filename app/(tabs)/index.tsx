import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCalendar } from "../../components/provider/CalendarProvider";
import { useRecents } from "../../components/provider/RecentsProvider";
import { useBoard } from "../../components/provider/BoardProvider";
import Card from "../../components/ui/Card";
import HeaderBar from "../../components/ui/HeaderBar";
import ListItem from "../../components/ui/ListItem";

export default function HomeScreen() {
  const { lastNote, lastPdf } = useRecents();
  const { events } = useCalendar();
  const { posts } = useBoard();
  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.end) >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 3);
  }, [events]);
  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);
  return (
    <View style={styles.container}>
      <HeaderBar title="Flowin" subtitle="학습을 더 효과적으로" />    
      <Text style={styles.section}>캘린더(다가오는 일정)</Text>
      <View style={styles.grid}>
        {upcoming.length === 0 ? (
          <Text style={styles.muted}>다가오는 일정이 없습니다.</Text>
        ) : (
          upcoming.map((e) => (
            <Card key={e.id} title={e.title} subtitle={`${formatDayTime(e.start)} • ${e.place || "장소 미정"}`} onPress={() => router.push({ pathname: "/(tabs)/calendar/edit", params: { id: e.id } })} />
          ))
        )}
      </View>

      <Text style={styles.section}>최근</Text>
      <View style={styles.grid}>
        <Card
          title={lastNote?.title || "최근 노트 없음"}
          subtitle="마지막으로 편집한 노트"
          icon="document-text-outline"
          onPress={() => router.push("/(tabs)/notes" as any)}
        />
        <Card
          title={lastPdf?.title || "최근 PDF 없음"}
          subtitle="마지막으로 본 PDF"
          icon="book-outline"
          onPress={() => router.push("/(tabs)/study" as any)}
        />
      </View>

      <View style={styles.rowHeader}>
        <Text style={styles.section}>게시판</Text>
        <Pressable onPress={() => router.push("/(tabs)/board" as any)} hitSlop={10}>
          <Text style={styles.more}>+ more</Text>
        </Pressable>
      </View>
      <View style={[styles.grid, { paddingHorizontal: 16 }]}>
        {recentPosts.map((p) => (
          <ListItem
            key={p.id}
            title={p.title}
            subtitle={`[${p.category}] ${p.author} • ${new Date(p.createdAt).toLocaleDateString()}`}
            onPress={() => router.push({ pathname: "/(tabs)/board/[id]", params: { id: p.id } })}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 0, backgroundColor: "#fff" },
  section: { fontSize: 14, fontWeight: "700", color: "#6b7280", margin: 16 },
  grid: { gap: 12, paddingHorizontal: 16 },
  muted: { color: "#6b7280" },
  rowHeader: { marginHorizontal: 16, marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  more: { color: "#2563eb", fontWeight: "800" },
});

function formatDayTime(iso: string) {
  try {
    const d = new Date(iso);
    const z = (n: number) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
