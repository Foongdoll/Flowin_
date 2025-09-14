import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import HeaderBar from "../../../components/ui/HeaderBar";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useCalendar } from "../../../components/provider/CalendarProvider";

export default function EditEvent() {
  const { id, start: startParam, end: endParam } = useLocalSearchParams<{ id?: string; start?: string; end?: string }>();
  const isNew = !id;
  const { get, add, update, remove } = useCalendar();
  const exist = useMemo(() => (id ? get(id) : undefined), [id, get]);

  const [title, setTitle] = useState(exist?.title || "");
  const [description, setDescription] = useState(exist?.description || "");
  const [participants, setParticipants] = useState(exist?.participants || "");
  const [place, setPlace] = useState(exist?.place || "");
  const [supplies, setSupplies] = useState(exist?.supplies || "");
  const [remarks, setRemarks] = useState(exist?.remarks || "");
  const [start, setStart] = useState(
    exist?.start || (typeof startParam === "string" ? startParam : toLocalISO(new Date()))
  );
  const [end, setEnd] = useState(
    exist?.end || (typeof endParam === "string" ? endParam : toLocalISO(new Date(Date.now() + 60 * 60 * 1000)))
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (exist) {
      setTitle(exist.title);
      setDescription(exist.description || "");
      setParticipants(exist.participants || "");
      setPlace(exist.place || "");
      setSupplies(exist.supplies || "");
      setRemarks(exist.remarks || "");
      setStart(exist.start);
      setEnd(exist.end);
    }
  }, [exist]);

  const errors = {
    title: !title.trim() ? "제목을 입력하세요." : undefined,
    start: !validISO(start) ? "시작일시 형식(YYYY-MM-DD HH:mm)" : undefined,
    end: !validISO(end) ? "종료일시 형식(YYYY-MM-DD HH:mm)" : undefined,
    range: validISO(start) && validISO(end) && new Date(start) > new Date(end) ? "종료가 시작보다 빠릅니다." : undefined,
  } as const;
  const isValid = !errors.title && !errors.start && !errors.end && !errors.range;

  const onSave = () => {
    setSubmitted(true);
    if (!isValid) return;
    if (isNew) {
      add({ title, description, participants, place, supplies, remarks, start, end });
      router.replace("/(tabs)/calendar" as any);
    } else {
      update(id!, { title, description, participants, place, supplies, remarks, start, end });
      Alert.alert("저장 완료", "일정이 저장되었습니다.");
      router.replace("/(tabs)/calendar" as any);
    }
  };

  const onDelete = () => {
    if (!id) return;
    Alert.alert("삭제", "이 일정을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          remove(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title={isNew ? "일정 추가" : "일정 편집"} leftIcon="chevron-back" onLeftPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Input label="제목" placeholder="예: 스터디 모임" value={title} onChangeText={setTitle} error={submitted ? errors.title : undefined} returnKeyType="next" />
        <Input label="내용" placeholder="자세한 내용" value={description} onChangeText={setDescription} multiline style={{ minHeight: 100 }} textAlignVertical="top" />
        <Input label="참여자" placeholder="쉼표로 구분" value={participants} onChangeText={setParticipants} />
        <Input label="장소" placeholder="예: 강남 카페" value={place} onChangeText={setPlace} />
        <Input label="준비물" placeholder="예: 노트북, 필기도구" value={supplies} onChangeText={setSupplies} />
        <Input label="비고" placeholder="기타 메모" value={remarks} onChangeText={setRemarks} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="시작일시" placeholder="YYYY-MM-DD HH:mm" value={fromISO(start)} onChangeText={(t) => setStart(toISOFromLocalString(t))} error={submitted ? errors.start : undefined} />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Input label="종료일시" placeholder="YYYY-MM-DD HH:mm" value={fromISO(end)} onChangeText={(t) => setEnd(toISOFromLocalString(t))} error={submitted ? errors.end : undefined} />
          </View>
        </View>
        {submitted && errors.range ? <Text style={styles.error}>{errors.range}</Text> : null}

        <View style={styles.actions}>
          {!isNew ? <Button title="삭제" variant="secondary" onPress={onDelete} /> : null}
          <Button title="저장" onPress={onSave} />
        </View>
      </ScrollView>
    </View>
  );
}

function validISO(iso: string) {
  const d = new Date(iso);
  return !isNaN(d.getTime());
}

function toLocalISO(d: Date) {
  // Keep local time in ISO-like string without timezone (YYYY-MM-DDTHH:mm)
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromISO(iso: string) {
  // Display as YYYY-MM-DD HH:mm
  return iso.replace("T", " ");
}

function toISOFromLocalString(s: string) {
  // Accept "YYYY-MM-DD HH:mm" and convert back to "YYYY-MM-DDTHH:mm"
  return s.trim().replace(" ", "T");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  form: { padding: 16, gap: 12, paddingBottom: 40 },
  row: { flexDirection: "row" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  error: { color: "#ef4444" },
});
