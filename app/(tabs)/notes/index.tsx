import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { palette } from "../../../components/ui/theme";

type Note = { id: string; title: string };

export default function NotesIndex() {
  const [notes] = useState<Note[]>([
    { id: "n1", title: "리액트 요약 노트" },
    { id: "n2", title: "영단어 암기 노트" },
  ]);
  const [q, setQ] = useState("");
  const data = useMemo(() => notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase())), [notes, q]);

  return (
    <View style={styles.container}>
      <HeaderBar title="노트" subtitle="공책" />
      <View style={styles.body}>
        <SearchInput value={q} onChangeText={setQ} placeholder="노트 제목 검색" />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem title={item.title} subtitle="수정: 방금 전" onPress={() => router.push({ pathname: "/(tabs)/notes/edit", params: { id: item.id } })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
        />
      </View>
      <FAB label="새 노트" icon="create-outline" onPress={() => router.push("/(tabs)/notes/edit" as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  body: { padding: 20, gap: 16 },
});
