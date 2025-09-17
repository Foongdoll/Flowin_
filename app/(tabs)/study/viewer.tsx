import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DrawingCanvas from "../../../components/ui/DrawingCanvas";
import HeaderBar from "../../../components/ui/HeaderBar";
import IconButton from "../../../components/ui/IconButton";
import { useRecents } from "../../../components/provider/RecentsProvider";
import { palette } from "../../../components/ui/theme";
import { useDocs } from "../../../components/provider/DocsProvider";

export default function PdfViewer() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  const { get, fileUrl } = useDocs();
  const docId = typeof id === "string" ? id : undefined;
  const doc = docId ? get(docId) : undefined;
  const [maskOn, setMaskOn] = useState(false);
  const [drawOn, setDrawOn] = useState(false);
  const [drawMode, setDrawMode] = useState<"dots" | "lines">("lines");
  const [clearKey, setClearKey] = useState(0);
  const [undoKey, setUndoKey] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeCount, setStrokeCount] = useState(0);
  const [memos] = useState<string[]>([]);
  const { setLastPdf } = useRecents();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const contentLines: string[] = [];

  const addMemo = () => {
    Alert.alert("메모", "메모 작성 기능은 아직 준비 중입니다.");
  };

  const openDocument = () => {
    if (!doc) {
      Alert.alert("안내", "문서를 찾을 수 없습니다.");
      return;
    }
    const url = fileUrl(doc);
    Linking.openURL(url).catch(() => Alert.alert("오류", "파일을 열 수 없습니다."));
  };

  useEffect(() => {
    setLastPdf({ id: doc ? doc.id : docId, title: doc ? doc.title : typeof title === "string" ? title : undefined });
  }, [doc, docId, title, setLastPdf]);

  return (
    <View style={styles.container}>
      <HeaderBar title={doc?.title || (typeof title === "string" ? title : "PDF 뷰어")} leftIcon="chevron-back" onLeftPress={() => router.back()} rightIcon={drawOn ? "brush" : "brush-outline"} onRightPress={() => setDrawOn((v) => !v)} />
      <View style={styles.toolbarRow}>
        <IconButton name={maskOn ? "eye-off-outline" : "eye-outline"} onPress={() => { setMaskOn((v) => !v); if (maskOn) setRevealed(new Set()); }} background={palette.accent} color={palette.textPrimary} />
        <IconButton name={drawMode === "lines" ? "remove-outline" : "ellipsis-horizontal"} onPress={() => setDrawMode((m) => (m === "lines" ? "dots" : "lines"))} background={palette.accent} color={palette.textPrimary} />
        <IconButton name="cut-outline" onPress={() => setTool((t) => (t === "pen" ? "eraser" : "pen"))} background={tool === "eraser" ? palette.accent : undefined} color={tool === "eraser" ? palette.textPrimary : palette.accent} />
        <IconButton name="return-up-back-outline" onPress={() => setUndoKey((k) => k + 1)} disabled={strokeCount === 0} />
        <IconButton name="trash-outline" onPress={() => setClearKey((k) => k + 1)} />
        <IconButton name="create-outline" onPress={addMemo} background={palette.accent} color={palette.textPrimary} />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{doc?.originalName || doc?.title || "문서 정보 없음"}</Text>
        {doc ? (
          <Text style={styles.infoMeta}>
            {formatDocMeta(doc.size, doc.uploadedAt)}
          </Text>
        ) : (
          <Text style={styles.infoMeta}>연결된 문서가 없습니다.</Text>
        )}
        <Pressable style={styles.openButton} onPress={openDocument}>
          <Text style={styles.openButtonText}>파일 열기</Text>
        </Pressable>
      </View>

      <View style={styles.page}>
        {contentLines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>표시할 PDF 내용이 없습니다.</Text>
          </View>
        ) : (
          contentLines.map((line, idx) => (
            <Pressable
              key={idx}
              style={styles.textRow}
              onPress={() => {
                if (!maskOn) return;
                setRevealed((prev) => {
                  const next = new Set(prev);
                  if (next.has(idx)) next.delete(idx);
                  else next.add(idx);
                  return next;
                });
              }}
            >
              <Text style={styles.text}>{maskOn && !revealed.has(idx) ? "■■■■■■■■■■■■■■■■■■" : line}</Text>
            </Pressable>
          ))
        )}
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
  infoBox: { padding: 16, borderBottomWidth: 1, borderColor: palette.cardBorder, gap: 6, backgroundColor: palette.backgroundAlt },
  infoTitle: { fontWeight: "700", color: palette.textPrimary },
  infoMeta: { color: palette.textSecondary },
  openButton: { marginTop: 6, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: palette.accent },
  openButtonText: { color: palette.textPrimary, fontWeight: "700" },
  page: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  textRow: { marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 22, color: palette.textPrimary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: palette.textMuted },
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

function formatDocMeta(size: number, uploadedAt: string) {
  const kb = size / 1024;
  const sizeLabel = kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb.toFixed(1) + " KB";
  const date = new Date(uploadedAt);
  const dateLabel = Number.isNaN(date.getTime()) ? uploadedAt : date.toLocaleString();
  return sizeLabel + " • " + dateLabel;
}
