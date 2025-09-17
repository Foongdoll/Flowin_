import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useBoard, Post } from "../../../components/provider/BoardProvider";
import HeaderBar from "../../../components/ui/HeaderBar";
import { palette } from "../../../components/ui/theme";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { get, fetchById } = useBoard();
  const postId = typeof id === "string" ? id : undefined;
  const [post, setPost] = useState<Post | undefined>(postId ? get(postId) : undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!postId) return;
    if (post) return;
    setLoading(true);
    setError(null);
    fetchById(postId)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId, post, fetchById]);

  useEffect(() => {
    if (postId) {
      const latest = get(postId);
      if (latest) setPost(latest);
    }
  }, [postId, get, post]);

  const title = post?.title || "게시글";
  const meta = post
    ? "[" + post.category + "] " + (post.authorName || "익명") + " • " + new Date(post.createdAt).toLocaleString()
    : "";

  return (
    <View style={styles.container}>
      <HeaderBar title={title} leftIcon="chevron-back" onLeftPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <Text style={styles.meta}>불러오는 중...</Text> : null}
        {error ? <Text style={[styles.meta, { color: palette.danger }]}>{error}</Text> : null}
        {!loading && !error && !post ? <Text style={styles.meta}>게시글을 찾을 수 없습니다.</Text> : null}
        {post ? (
          <>
            <Text style={styles.meta}>{meta}</Text>
            <Text style={styles.body}>{post.content}</Text>
          </>
        ) : null}
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
