import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";

type Msg = { id: string; from: "me" | "friend"; text: string };

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", from: "friend", text: "안녕! 공부 잘 되고 있어?" },
    { id: "m2", from: "me", text: "응! 노트 정리 중이야." },
  ]);
  const listRef = useRef<FlatList<Msg>>(null);

  const friendName = useMemo(() => (id ? `친구 (${id})` : "친구"), [id]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((prev) => [...prev, { id: `${Date.now()}`, from: "me", text }]);
    setText("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <HeaderBar title={friendName} leftIcon="chevron-back" onLeftPress={() => router.back()} />
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === "me" ? styles.mine : styles.theirs]}>
              <Text style={[styles.msg, item.from === "me" && styles.msgMine]}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 76 }}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="메시지 입력" />
          <IconButton name="send" color="#fff" background="#111827" onPress={send} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  bubble: { maxWidth: "75%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  mine: { backgroundColor: "#111827", alignSelf: "flex-end" },
  theirs: { backgroundColor: "#e5e7eb", alignSelf: "flex-start" },
  msg: { color: "#111827", ...(Platform.OS !== "web" ? {} : {}) },
  msgMine: { color: "#ffffff" },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderColor: "#e5e7eb", position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12 },
});
