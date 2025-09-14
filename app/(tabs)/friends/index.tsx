import React, { useMemo, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import SearchInput from "../../../components/ui/SearchInput";
import ListItem from "../../../components/ui/ListItem";

const friends = [
  { id: "u1", name: "이영희" },
  { id: "u2", name: "김철수" },
  { id: "u3", name: "John" },
];

export default function FriendsIndex() {
  const [q, setQ] = useState("");
  const data = useMemo(() => friends.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <View style={styles.container}>
      <HeaderBar title="친구" subtitle="대화하기" />
      <View style={styles.body}>
        <SearchInput value={q} onChangeText={setQ} placeholder="친구 검색" />
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem title={item.name} subtitle="온라인" onPress={() => router.push({ pathname: "/(tabs)/friends/[id]", params: { id: item.id } })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingTop: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  body: { padding: 16, gap: 12 },
});
