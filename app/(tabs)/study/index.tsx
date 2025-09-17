import React, { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { palette } from "../../../components/ui/theme";
import { useDocs } from "../../../components/provider/DocsProvider";

export default function StudyIndex() {
  const { docs, loading, refresh, upload, remove } = useDocs();
  const [q, setQ] = useState("");
  const normalized = q.trim().toLowerCase();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const data = useMemo(() => {
    if (!normalized) return docs;
    return docs.filter((doc) => doc.title.toLowerCase().includes(normalized));
  }, [docs, normalized]);

  const emptyMessage = loading ? "자료를 불러오는 중입니다..." : normalized ? "검색 결과가 없습니다." : "등록된 자료가 없습니다.";
  const renderEmpty = useCallback(() => <Text style={styles.empty}>{emptyMessage}</Text>, [emptyMessage]);

  const onUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      await upload({
        file: {
          uri: asset.uri,
          name: asset.name || "자료",
          type: asset.mimeType || "application/octet-stream",
        },
        title: asset.name,
      });
      Alert.alert("업로드", "자료가 업로드되었습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "업로드에 실패했습니다.";
      Alert.alert("오류", message);
    }
  }, [upload]);

  const confirmDelete = (id: string, title: string) => {
    Alert.alert("삭제", title + " 문서를 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          remove(id).catch(() => Alert.alert("오류", "삭제하지 못했습니다."));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="PDF" subtitle="라이브러리" />
      <View style={styles.body}>
        <SearchInput value={q} onChangeText={setQ} placeholder="PDF 제목 검색" />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={formatDocMeta(item.size, item.uploadedAt)}
              onPress={() => router.push({ pathname: "/(tabs)/study/viewer", params: { id: item.id } })}
              right={
                <Pressable onPress={() => confirmDelete(item.id, item.title)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={palette.textMuted} />
                </Pressable>
              }
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
      <FAB label="업로드" icon="cloud-upload-outline" onPress={onUpload} />
    </View>
  );
}

function formatDocMeta(size: number, uploadedAt: string) {
  const kb = size / 1024;
  const sizeLabel = kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb.toFixed(1) + " KB";
  const date = new Date(uploadedAt);
  const dateLabel = Number.isNaN(date.getTime()) ? uploadedAt : date.toLocaleDateString();
  return sizeLabel + " • " + dateLabel;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  body: { padding: 20, gap: 16 },
  empty: { textAlign: "center", color: palette.textMuted, paddingVertical: 32 },
});
