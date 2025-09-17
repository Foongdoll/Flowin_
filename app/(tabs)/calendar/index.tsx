import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import HeaderBar from "../../../components/ui/HeaderBar";
import CalendarMonth from "../../../components/ui/CalendarMonth";
import ListItem from "../../../components/ui/ListItem";
import FAB from "../../../components/ui/FAB";
import { ScheduleFilterCard } from '../../../components/ui/ScheduleFilterCard';
import { useCalendar } from "../../../components/provider/CalendarProvider";
import { router } from "expo-router";
import tokens from '../../../theme/tokens';
import AmbientBackdrop from "@/components/ui/AmbientBackdrop";

export default function CalendarIndex() {
  const { events } = useCalendar();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  
  // Restore filter state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      
      return () => {
      
      };
    }, [])
  );

  const eventsByDayKey = useMemo(() => {
    const map: Record<string, number> = {};
    events.forEach(e => {
      const d = keyOf(new Date(e.start));
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    const k = keyOf(selected);
    const handleSearch = (params: {
      searchTerm: string;
      dateRange: { startDate: Date; endDate: Date };
      sortBy: 'date' | 'priority' | 'title';
    }) => {
      console.log('Search params:', params);
      // TODO: Implement search logic
    };
    return events
      .filter((e) => keyOf(new Date(e.start)) === k)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events, selected]);

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const onSelect = (d: Date) => {
    setSelected(d);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const addForSelected = () => {
    const start = `${keyOf(selected)}T09:00`;
    const end = `${keyOf(selected)}T10:00`;
    router.push({ pathname: "/(tabs)/calendar/edit", params: { start, end } });
  };

  return (
    <View style={styles.container}>
      <AmbientBackdrop />
      <HeaderBar title="캘린더" subtitle="일정" />
      <View style={styles.body}>
        <CalendarMonth
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          selected={selected}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onSelect={onSelect}
          eventsByDayKey={eventsByDayKey}
        />

        <Text style={styles.section}>{formatDayHeader(selected)}</Text>
        {dayEvents.length === 0 ? (
          <Text style={styles.emptyText}>해당 날짜의 일정이 없습니다.</Text>
        ) : (
          <FlatList
            data={dayEvents}
            keyExtractor={(e) => e.id}
            renderItem={({ item }) => (
              <ListItem
                title={item.title}
                subtitle={`${formatRange(item.start, item.end)} • ${item.place || "장소 미정"}`}
                onPress={() => router.push({ pathname: "/(tabs)/calendar/view", params: { id: item.id } })}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
          />
        )}
      </View>
      <FAB label="일정 추가" icon="add" onPress={addForSelected} />
    </View>
  );
}

function formatRange(startISO: string, endISO: string) {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const d = (n: number) => `${n}`.padStart(2, "0");
    const sStr = `${s.getFullYear()}.${d(s.getMonth() + 1)}.${d(s.getDate())} ${d(s.getHours())}:${d(s.getMinutes())}`;
    const eStr = `${e.getFullYear()}.${d(e.getMonth() + 1)}.${d(e.getDate())} ${d(e.getHours())}:${d(e.getMinutes())}`;
    return `${sStr} ~ ${eStr}`;
  } catch {
    return `${startISO} ~ ${endISO}`;
  }
}

function keyOf(d: Date) {
  const z = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function formatDayHeader(d: Date) {
  const z = (n: number) => `${n}`.padStart(2, "0");
  const yoil = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}.${z(d.getMonth() + 1)}.${z(d.getDate())} (${yoil})`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    position: 'relative',
  },
  body: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  empty: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.sm,
  },
  section: {
    marginTop: tokens.spacing.sm,
    fontFamily: tokens.typography.fontFamily.bold,
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.md,
  },
});
