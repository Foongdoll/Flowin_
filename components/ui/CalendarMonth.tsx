import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import IconButton from "./IconButton";

type Props = {
  year: number; // 4-digit
  month: number; // 0-11
  selected?: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onSelect?: (d: Date) => void;
  eventsByDayKey?: Record<string, number>; // key: YYYY-MM-DD
};

export default function CalendarMonth({ year, month, selected, onPrevMonth, onNextMonth, onSelect, eventsByDayKey = {} }: Props) {
  const todayKey = keyOf(new Date());
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconButton name="chevron-back" onPress={onPrevMonth} />
        <Text style={styles.monthTitle}>{formatYearMonth(year, month)}</Text>
        <IconButton name="chevron-forward" onPress={onNextMonth} />
      </View>

      <View style={styles.weekHeader}>
        {WEEK_LABELS.map((w, i) => (
          <Text key={w} style={[styles.weekLabel, i === 0 && styles.sunText, i === 6 && styles.satText]}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((d) => {
          const inMonth = d.getMonth() === month;
          const k = keyOf(d);
          const isSelected = selected && keyOf(selected) === k;
          const isToday = k === todayKey;
          const dow = d.getDay();
          const events = eventsByDayKey[k] || 0;
          return (
            <Pressable
              key={k}
              style={({ pressed }) => [
                styles.cell,
                !inMonth && styles.outMonth,
                isSelected && styles.selected,
                pressed && styles.pressed,
              ]}
              onPress={() => onSelect?.(d)}
            >
              <Text
                style={[
                  styles.dayText,
                  !inMonth && styles.outMonthText,
                  dow === 0 && styles.sunText,
                  dow === 6 && styles.satText,
                  isSelected && styles.selectedText,
                ]}
              >
                {d.getDate()}
              </Text>
              <View style={styles.dotRow}>
                {isToday && !isSelected ? <View style={styles.todayDot} /> : null}
                {events > 0 ? <View style={styles.eventDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"]; // Sun..Sat

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  // Move start to Sunday of the week containing the 1st
  start.setDate(1 - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function keyOf(d: Date) {
  const z = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function formatYearMonth(y: number, m: number) {
  return `${y}.${(m + 1).toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 8 },
  monthTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  weekHeader: { flexDirection: "row", paddingHorizontal: 8, paddingBottom: 6 },
  weekLabel: { flex: 1, textAlign: "center", color: "#6b7280", fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4, paddingBottom: 8 },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  pressed: { backgroundColor: "#f3f4f6" },
  selected: { backgroundColor: "#111827" },
  dayText: { fontWeight: "700", color: "#111827" },
  selectedText: { color: "#ffffff" },
  outMonth: { opacity: 0.55 },
  outMonthText: { color: "#9ca3af" },
  sunText: { color: "#ef4444" },
  satText: { color: "#2563eb" },
  dotRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#111827" },
  eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
});
