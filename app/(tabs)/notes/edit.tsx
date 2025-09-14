import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from "react-native";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";
import DrawingCanvas from "../../../components/ui/DrawingCanvas";
import { useRecents } from "../../../components/provider/RecentsProvider";

export default function EditNote() {
  const [content, setContent] = useState<string>("# 제목\n\n여기에 마크다운으로 메모를 작성하세요.");
  const [preview, setPreview] = useState(false);
  const [drawOn, setDrawOn] = useState(false);
  const [penColor, setPenColor] = useState<string>("#111827");
  const [clearKey, setClearKey] = useState(0);
  const { setLastNote } = useRecents();

  const fakeRendered = useMemo(() => {
    // Placeholder: later replace with Markdown renderer
    // Bold for lines starting with '#'
    return content.split("\n").map((line, i) => (
      <Text key={i} style={[styles.previewLine, line.trim().startsWith("#") && styles.previewHeading]}>
        {line}
      </Text>
    ));
  }, [content]);

  useEffect(() => {
    // Use first heading as title fallback
    const first = content.split("\n").find((l) => l.trim().startsWith("#"));
    const title = first ? first.replace(/^#+\s*/, "").trim() : "제목 없음";
    setLastNote({ title });
  }, [content, setLastNote]);

  return (
    <View style={styles.container}>
      <HeaderBar title="노트 편집" rightIcon="save-outline" onRightPress={() => { /* TODO: save */ }} />
      <View style={styles.toolbar}>
        <IconButton name={preview ? "pencil-outline" : "eye-outline"} onPress={() => setPreview((p) => !p)} background="#111827" color="#fff" />
        <IconButton name={drawOn ? "brush" : "brush-outline"} onPress={() => setDrawOn((d) => !d)} background="#111827" color="#fff" />
        {drawOn ? (
          <>
            <View style={styles.colorRow}>
              {['#111827','#ef4444','#0ea5e9','#10b981','#f59e0b'].map((c) => (
                <Pressable key={c} onPress={() => setPenColor(c)} style={[styles.swatch, { backgroundColor: c }, penColor === c && styles.swatchActive]} />
              ))}
            </View>
            <IconButton name="trash-outline" onPress={() => setClearKey((k) => k + 1)} />
          </>
        ) : null}
      </View>
      {preview ? (
        <ScrollView style={styles.preview} contentContainerStyle={{ padding: 16 }}>
          {fakeRendered}
        </ScrollView>
      ) : (
        <TextInput
          style={styles.input}
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          autoCorrect={false}
          autoCapitalize="none"
        />
      )}
      <DrawingCanvas enabled={drawOn} strokeColor={penColor} mode="lines" clearTrigger={clearKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  toolbar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  colorRow: { flexDirection: "row", gap: 8, marginLeft: 6, alignItems: "center" },
  swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
  swatchActive: { borderColor: "#111827" },
  input: { flex: 1, padding: 16, fontSize: 16 },
  preview: { flex: 1 },
  previewLine: { fontSize: 16, lineHeight: 22 },
  previewHeading: { fontWeight: "700" },
});
