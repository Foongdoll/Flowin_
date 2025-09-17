import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { palette } from "../../../components/ui/theme";
import { useNotes } from "../../../components/provider/NotesProvider";

export default function NotesIndex() {
  const { notes, loading, refresh } = useNotes();
  const [q, setQ] = useState("");
  const normalized = q.trim().toLowerCase();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const data = useMemo(() => {
    if (!normalized) return notes;
    return notes.filter((n) => n.title.toLowerCase().includes(normalized));
  }, [notes, normalized]);

  const emptyMessage = loading ? "노트를 불러오는 중입니다..." : normalized ? "검색 결과가 없습니다." : "등록된 노트가 없습니다.";
  const renderEmpty = useCallback(() => <Text style={styles.empty}>{emptyMessage}</Text>, [emptyMessage]);

  return (
    <View style={styles.container}>
      <HeaderBar title="노트" subtitle="공책" />
      <View style={styles.body}>
        <SearchInput value={q} onChangeText={setQ} placeholder="노트 제목 검색" />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={"수정: " + new Date(item.updatedAt).toLocaleString()}
              onPress={() => router.push({ pathname: "/(tabs)/notes/edit", params: { id: item.id } })}
            />
          )}
          extraData={emptyMessage}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
          refreshing={loading}
          onRefresh={refresh}
        />
      </View>
      <FAB label="새 노트" icon="create-outline" onPress={() => router.push("/(tabs)/notes/edit" as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  body: { padding: 20, gap: 16 },
  empty: { textAlign: "center", color: palette.textMuted, paddingVertical: 32 },
});
