import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import IconButton from "./IconButton";
import { palette } from "./theme";

type Props = {
  year: number; // 4-digit
  month: number; // 0-11
  selected?: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onSelect?: (d: Date) => void;
  eventsByDayKey?: Record<string, number>; // key: YYYY-MM-DD
};

const CELL_WIDTH = `${100 / 7}%` as const;

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
                {events > 0 ? <View style={[styles.eventDot, { opacity: Math.min(1, 0.45 + events * 0.15) }]} /> : null}
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
  const z = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
}

function formatYearMonth(y: number, m: number) {
  return y + "." + (m + 1).toString().padStart(2, "0");
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.backgroundAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: palette.cardBorder,
  },
  monthTitle: { fontSize: 18, fontWeight: "800", color: palette.textPrimary, letterSpacing: 0.4 },
  weekHeader: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 },
  weekLabel: { flex: 1, textAlign: "center", color: palette.textSecondary, fontWeight: "700", letterSpacing: 0.2 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 6, paddingBottom: 8 },
  cell: {
    width: CELL_WIDTH,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginVertical: 4,
  },
  pressed: { backgroundColor: "rgba(148,163,184,0.16)" },
  selected: { backgroundColor: "rgba(99,102,241,0.55)", borderWidth: 1, borderColor: palette.accent },
  dayText: { fontWeight: "700", color: palette.textPrimary },
  selectedText: { color: palette.textPrimary },
  outMonth: { opacity: 0.45 },
  outMonthText: { color: palette.textMuted },
  sunText: { color: palette.danger },
  satText: { color: palette.accent },
  dotRow: { flexDirection: "row", gap: 4, marginTop: 6 },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.warning },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.accentAlt },
});

export { keyOf };
