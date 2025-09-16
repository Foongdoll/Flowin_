import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useBoard } from "../../../components/provider/BoardProvider";
import HeaderBar from "../../../components/ui/HeaderBar";
import { palette } from "../../../components/ui/theme";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { get } = useBoard();
  const post = id ? get(id) : undefined;
  return (
    <View style={styles.container}>
      <HeaderBar title={post?.title || "게시글"} leftIcon="chevron-back" onLeftPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.meta}>[{post?.category}] {post?.author} • {post ? new Date(post.createdAt).toLocaleString() : ""}</Text>
        <Text style={styles.body}>{post?.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 14 },
  meta: { color: palette.textMuted },
  body: { color: palette.textPrimary, lineHeight: 22 },
});
