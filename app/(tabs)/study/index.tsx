import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";

const samplePdfs = [
  { id: "1", title: "영어 단어장.pdf" },
  { id: "2", title: "한국사 요약.pdf" },
  { id: "3", title: "수학 공식집.pdf" },
];

export default function StudyIndex() {
  const [q, setQ] = useState("");
  const data = useMemo(() => samplePdfs.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())), [q]);
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
              subtitle="샘플 파일"
              onPress={() => router.push({ pathname: "/(tabs)/study/viewer", params: { id: item.id, title: item.title } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
        />
      </View>
      <FAB label="업로드" icon="cloud-upload-outline" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  body: { padding: 16, gap: 12 },
});
