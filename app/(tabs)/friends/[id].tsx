import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";
import { Image as ExpoImage } from "expo-image";
import { palette } from "../../../components/ui/theme";
// Image/Video picking requires: expo install expo-image-picker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as ImagePicker from "expo-image-picker";
import { useFriends } from "../../../components/provider/FriendsProvider";

type Msg =
  | { id: string; from: "me" | "friend"; type: "text"; text: string }
  | { id: string; from: "me" | "friend"; type: "image"; uri: string }
  | { id: string; from: "me" | "friend"; type: "video"; uri: string };

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getFriend } = useFriends();
  const friendId = typeof id === "string" ? id : undefined;
  const friend = useMemo(() => (friendId ? getFriend(friendId) : undefined), [friendId, getFriend]);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const listRef = useRef<FlatList<Msg>>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const friendName = friend?.name || (friendId ? "친구" : "친구");

  const send = () => {
    if (!text.trim()) return;
    setMsgs((prev) => [...prev, { id: `${Date.now()}`, from: "me", type: "text", text }]);
    setText("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const pickImage = async () => {
    try {
      // Request permission if needed
      await ImagePicker.requestMediaLibraryPermissionsAsync?.();
      const result = await ImagePicker.launchImageLibraryAsync?.({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (result?.canceled || !result?.assets?.length) return;
      const uri = result.assets[0].uri;
      setMsgs((prev) => [...prev, { id: `${Date.now()}`, from: "me", type: "image", uri }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      // noop: module may not be installed in dev
    }
  };

  const pickVideo = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync?.();
      const result = await ImagePicker.launchImageLibraryAsync?.({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 });
      if (result?.canceled || !result?.assets?.length) return;
      const uri = result.assets[0].uri;
      setMsgs((prev) => [...prev, { id: `${Date.now()}`, from: "me", type: "video", uri }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      // noop
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <HeaderBar title={friendName} leftIcon="chevron-back" onLeftPress={() => router.back()} />
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>아직 메시지가 없습니다. 대화를 시작해 보세요.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const common = [styles.bubble, item.from === "me" ? styles.mine : styles.theirs];
            if (item.type === "text") {
              return (
                <View style={common}>
                  <Text style={[styles.msg, item.from === "me" && styles.msgMine]}>{item.text}</Text>
                </View>
              );
            }
            if (item.type === "image") {
              return (
                <View style={common}>
                  <ExpoImage source={{ uri: item.uri }} style={styles.image} contentFit="cover" />
                </View>
              );
            }
            // video placeholder (render thumbnail/player later with expo-av)
            return (
              <View style={common}>
                <Text style={[styles.msg, item.from === "me" && styles.msgMine]}>동영상 첨부됨</Text>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 76 }}
        />
        {/* Emoji picker */}
        {showEmoji ? (
          <View style={styles.emojiPanel}>
            {"😀 😂 😍 🤔 🙌 👍 👀 🥳 😭 😎 💯 ⭐️ ❤️ ✨ 🔥 🎉 📌 📝 🧠".split(" ").map((e, i) => (
              <Pressable key={`${e}-${i}`} onPress={() => setText((t) => t + e)} style={styles.emojiCell}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <IconButton name={showEmoji ? "happy" : "happy-outline"} onPress={() => setShowEmoji((v) => !v)} />
          <IconButton name="image-outline" onPress={pickImage} />
          <IconButton name="videocam-outline" onPress={pickVideo} />
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="메시지 입력" placeholderTextColor={palette.textMuted} />
          <IconButton name="send" color={palette.textPrimary} background={palette.accent} onPress={send} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  bubble: { maxWidth: "75%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  mine: { backgroundColor: palette.accent, alignSelf: "flex-end" },
  theirs: { backgroundColor: palette.backgroundAlt, alignSelf: "flex-start" },
  msg: { color: palette.textPrimary, ...(Platform.OS !== "web" ? {} : {}) },
  msgMine: { color: palette.textPrimary },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderColor: palette.cardBorder, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: palette.backgroundAlt },
  input: { flex: 1, borderWidth: 1, borderColor: palette.cardBorder, borderRadius: 12, paddingHorizontal: 12, color: palette.textPrimary, backgroundColor: palette.background },
  image: { width: 160, height: 160, borderRadius: 8 },
  emojiPanel: { position: "absolute", left: 0, right: 0, bottom: 60, backgroundColor: palette.backgroundAlt, borderTopWidth: 1, borderColor: palette.cardBorder, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4, flexDirection: "row", flexWrap: "wrap" },
  emojiCell: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, margin: 4, backgroundColor: "rgba(124,92,255,0.15)" },
  empty: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: palette.textMuted },
});
