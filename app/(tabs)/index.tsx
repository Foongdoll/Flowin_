import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "../../components/ui/theme";
import AmbientBackdrop from "../../components/ui/AmbientBackdrop";
import { useCalendar } from "../../components/provider/CalendarProvider";
import { useRecents } from "../../components/provider/RecentsProvider";
import { useBoard } from "../../components/provider/BoardProvider";
import Card from "../../components/ui/Card";
import HeaderBar from "../../components/ui/HeaderBar";
import ListItem from "../../components/ui/ListItem";

export default function HomeScreen() {
  const { lastNote, lastPdf } = useRecents();
  const { events } = useCalendar();
  const { allPosts, loading: boardLoading } = useBoard();
  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.end) >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 3);
  }, [events]);
  const recentPosts = useMemo(() => allPosts.slice(0, 5), [allPosts]);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeaderBar title="Flowin" subtitle="학습을 더 효과적으로" />

        <Text style={styles.section}>캘린더(다가오는 일정)</Text>
        <View style={styles.grid}>
          {upcoming.length === 0 ? (
            <Text style={styles.muted}>다가오는 일정이 없습니다.</Text>
          ) : (
            upcoming.map((e) => (
              <Card
                key={e.id}
                title={e.title}
                subtitle={formatDayTime(e.start) + " • " + (e.place || "장소 미정")}
                onPress={() => router.push({ pathname: "/(tabs)/calendar/view", params: { id: e.id } })}
              />
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
        <View style={[styles.grid, styles.boardList]}>
          {boardLoading ? (
            <Text style={styles.muted}>게시글을 불러오는 중입니다...</Text>
          ) : recentPosts.length === 0 ? (
            <Text style={styles.muted}>최근 게시글이 없습니다.</Text>
          ) : (
            recentPosts.map((p) => (
              <ListItem
                key={p.id}
                title={p.title}
                subtitle={"[" + p.category + "] " + (p.authorName || "익명") + " • " + new Date(p.createdAt).toLocaleDateString()}
                onPress={() => router.push({ pathname: "/(tabs)/board/[id]", params: { id: p.id } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 12 },
  section: { fontSize: 15, fontWeight: "800", color: palette.textSecondary, marginHorizontal: 16, marginTop: 12, letterSpacing: 0.3 },
  grid: { gap: 14, paddingHorizontal: 16 },
  boardList: { paddingHorizontal: 16 },
  muted: { color: palette.textMuted },
  rowHeader: { marginHorizontal: 16, marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  more: { color: palette.accentAlt, fontWeight: "800", letterSpacing: 0.4 },
});

function formatDayTime(iso: string) {
  try {
    const d = new Date(iso);
    const z = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
  } catch {
    return iso;
  }
}
