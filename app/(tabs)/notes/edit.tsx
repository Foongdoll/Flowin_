import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";
import DrawingCanvas from "../../../components/ui/DrawingCanvas";
import { useRecents } from "../../../components/provider/RecentsProvider";
import { useNotes } from "../../../components/provider/NotesProvider";
import { palette } from "../../../components/ui/theme";

export default function EditNote() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const noteId = typeof id === "string" ? id : undefined;
  const { fetchById, create, update } = useNotes();
  const [content, setContent] = useState<string>("");
  const [preview, setPreview] = useState(false);
  const [drawOn, setDrawOn] = useState(false);
  const [penColor, setPenColor] = useState<string>(palette.accent);
  const [clearKey, setClearKey] = useState(0);
  const [undoKey, setUndoKey] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeCount, setStrokeCount] = useState(0);
  const { setLastNote } = useRecents();
  const inputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    if (!noteId) {
      setContent("");
      setLoadedId(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchById(noteId)
      .then((note) => {
        if (!active) return;
        if (note) {
          setContent(note.content);
          setLoadedId(note.id);
        } else {
          Alert.alert("안내", "노트를 불러오지 못했습니다.");
        }
      })
      .catch((error) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "노트를 불러오지 못했습니다.";
        Alert.alert("오류", message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [noteId, fetchById]);

  const fakeRendered = useMemo(() => {
    return content.split("\n").map((line, index) => {
      const heading = line.trim().startsWith("#");
      return (
        <Text key={String(index)} style={[styles.previewLine, heading ? styles.previewHeading : null]}>
          {line}
        </Text>
      );
    });
  }, [content]);

  useEffect(() => {
    const first = content.split("\n").find((line) => line.trim().startsWith("#"));
    const title = first ? first.replace(/^#+\s*/, "").trim() : "제목 없음";
    setLastNote({ title });
  }, [content, setLastNote]);

  const deriveTitle = () => {
    const first = content.split("\n").find((line) => line.trim().length > 0);
    if (!first) return "제목 없음";
    const trimmed = first.trim();
    if (trimmed.startsWith("#")) {
      return trimmed.replace(/^#+\s*/, "").trim() || "제목 없음";
    }
    return trimmed.slice(0, 40);
  };

  const onSave = async () => {
    if (saving) return;
    const title = deriveTitle();
    try {
      setSaving(true);
      if (loadedId) {
        await update(loadedId, { title, content });
        Alert.alert("저장 완료", "노트가 저장되었습니다.");
      } else {
        const created = await create({ title, content });
        setLoadedId(created.id);
        Alert.alert("저장 완료", "노트가 생성되었습니다.");
        router.replace({ pathname: "/(tabs)/notes/edit", params: { id: created.id } });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "노트를 저장하지 못했습니다.";
      Alert.alert("오류", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="노트 편집" rightIcon={saving ? "hourglass-outline" : "save-outline"} onRightPress={onSave} />
      <View style={styles.toolbar}>
        <IconButton name={preview ? "pencil-outline" : "eye-outline"} onPress={() => setPreview((p) => !p)} background={palette.accent} color={palette.textPrimary} />
        <IconButton
          name={drawOn ? "brush" : "brush-outline"}
          onPress={() =>
            setDrawOn((d) => {
              const next = !d;
              if (next) {
                inputRef.current?.blur();
              } else {
                requestAnimationFrame(() => inputRef.current?.focus());
              }
              return next;
            })
          }
          background={palette.accent}
          color={palette.textPrimary}
        />
        {drawOn ? (
          <>
            <IconButton
              name="document-text-outline"
              onPress={() => {
                setDrawOn(false);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              background={palette.accent}
              color={palette.textPrimary}
            />
            <IconButton
              name="cut-outline"
              onPress={() => setTool((t) => (t === "pen" ? "eraser" : "pen"))}
              background={tool === "eraser" ? palette.accent : undefined}
              color={tool === "eraser" ? palette.textPrimary : palette.accent}
            />
            <IconButton name="return-up-back-outline" onPress={() => setUndoKey((k) => k + 1)} disabled={strokeCount === 0} />
            <IconButton name="trash-outline" onPress={() => setClearKey((k) => k + 1)} />
            {tool === "pen" ? (
              <View style={styles.colorRow}>
                {[palette.accent, palette.accentAlt, palette.accentWarm, palette.success, palette.warning].map((c) => (
                  <Pressable key={c} onPress={() => setPenColor(c)} style={[styles.swatch, { backgroundColor: c }, penColor === c ? styles.swatchActive : null]} />
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </View>
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.loadingText}>노트를 불러오는 중입니다...</Text>
          </View>
        ) : preview ? (
          <ScrollView style={styles.preview} contentContainerStyle={{ padding: 16 }}>
            {fakeRendered}
          </ScrollView>
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
          />
        )}
        <DrawingCanvas
          enabled={drawOn}
          strokeColor={penColor}
          mode="lines"
          clearTrigger={clearKey}
          tool={tool}
          undoTrigger={undoKey}
          onStrokeCountChange={setStrokeCount}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  toolbar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: palette.cardBorder },
  colorRow: { flexDirection: "row", gap: 8, marginLeft: 6, alignItems: "center" },
  swatch: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "transparent" },
  swatchActive: { borderColor: palette.accent },
  input: { flex: 1, padding: 16, fontSize: 16, color: palette.textPrimary, backgroundColor: palette.backgroundAlt, borderRadius: 16 },
  contentArea: { flex: 1 },
  preview: { flex: 1 },
  previewLine: { fontSize: 16, lineHeight: 22 },
  previewHeading: { fontWeight: "700" },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 8, color: palette.textMuted },
});
