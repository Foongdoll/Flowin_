import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DrawingCanvas from "../../../components/ui/DrawingCanvas";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";
import { useRecents } from "../../../components/provider/RecentsProvider";
import { palette } from "../../../components/ui/theme";

export default function PdfViewer() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  const [maskOn, setMaskOn] = useState(false);
  const [drawOn, setDrawOn] = useState(false);
  const [drawMode, setDrawMode] = useState<"dots" | "lines">("lines");
  const [clearKey, setClearKey] = useState(0);
  const [undoKey, setUndoKey] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeCount, setStrokeCount] = useState(0);
  const [memos, setMemos] = useState<string[]>([]);
  const { setLastPdf } = useRecents();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const sampleContent = useMemo(
    () => [
      "Photosynthesis is the process by which green plants convert light energy into chemical energy.",
      "광합성은 녹색 식물이 빛 에너지를 화학 에너지로 전환하는 과정입니다.",
    ],
    []
  );

  const addMemo = () => {
    const stamp = new Date().toLocaleTimeString();
    setMemos((prev) => [
      ...prev,
      `${stamp} - 예시 메모: 중요한 포인트 체크`,
    ]);
    Alert.alert("메모 추가", "예시 메모가 추가되었습니다.");
  };

  useEffect(() => {
    setLastPdf({ id: typeof id === "string" ? id : undefined, title: typeof title === "string" ? title : undefined });
  }, [id, title, setLastPdf]);

  return (
    <View style={styles.container}>
      <HeaderBar title={typeof title === "string" ? title : "PDF 뷰어"} leftIcon="chevron-back" onLeftPress={() => router.back()} rightIcon={drawOn ? "brush" : "brush-outline"} onRightPress={() => setDrawOn((v) => !v)} />
      <View style={styles.toolbarRow}>
        <IconButton name={maskOn ? "eye-off-outline" : "eye-outline"} onPress={() => { setMaskOn((v) => !v); if (maskOn) setRevealed(new Set()); }} background={palette.accent} color={palette.textPrimary} />
        <IconButton name={drawMode === "lines" ? "remove-outline" : "ellipsis-horizontal"} onPress={() => setDrawMode((m) => (m === "lines" ? "dots" : "lines"))} background={palette.accent} color={palette.textPrimary} />
        <IconButton name="cut-outline" onPress={() => setTool((t) => (t === "pen" ? "eraser" : "pen"))} background={tool === "eraser" ? palette.accent : undefined} color={tool === "eraser" ? palette.textPrimary : palette.accent} />
        <IconButton name="return-up-back-outline" onPress={() => setUndoKey((k) => k + 1)} disabled={strokeCount === 0} />
        <IconButton name="trash-outline" onPress={() => setClearKey((k) => k + 1)} />
        <IconButton name="create-outline" onPress={addMemo} background={palette.accent} color={palette.textPrimary} />
      </View>

      <View style={styles.page}>
        {sampleContent.map((line, idx) => (
          <Pressable key={idx} style={styles.textRow} onPress={() => {
            if (!maskOn) return;
            setRevealed((prev) => {
              const next = new Set(prev);
              if (next.has(idx)) next.delete(idx); else next.add(idx);
              return next;
            });
          }}>
            <Text style={styles.text}>{maskOn && !revealed.has(idx) ? "■■■■■■■■■■■■■■■■■■" : line}</Text>
          </Pressable>
        ))}
        <DrawingCanvas
          enabled={drawOn}
          mode={drawMode}
          clearTrigger={clearKey}
          tool={tool}
          undoTrigger={undoKey}
          onStrokeCountChange={setStrokeCount}
        />
      </View>

      <View style={styles.memoBox}>
        <Text style={styles.memoTitle}>메모</Text>
        {memos.length === 0 ? (
          <Text style={styles.memoEmpty}>아직 메모가 없습니다.</Text>
        ) : (
          memos.map((m, i) => (
            <Text key={`${m}-${i}`} style={styles.memoItem}>
              • {m}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  toolbarRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: palette.cardBorder },
  page: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  textRow: { marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 22, color: palette.textPrimary },
  memoBox: {
    borderTopWidth: 1,
    borderColor: palette.cardBorder,
    padding: 12,
    gap: 6,
    backgroundColor: palette.backgroundAlt,
  },
  memoTitle: { fontWeight: "700", color: palette.textSecondary },
  memoEmpty: { color: palette.textMuted },
  memoItem: { color: palette.textPrimary },
});
