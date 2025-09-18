import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import Input from "../../../components/ui/Input";
import { GameButton } from "../../../components/ui/GameButton";
import { useCalendar } from "../../../components/provider/CalendarProvider";
import tokens from "../../../theme/tokens";

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
  const formattedStart = fromISO(start);
  const formattedEnd = fromISO(end);
  const heroHeadline = title.trim() || "멋진 일정을 만들어봐요";
  const heroSub = isNew ? "새로운 일정" : "일정 편집";

  const onSave = async () => {
    setSubmitted(true);
    if (!isValid) return;
    try {
      if (isNew) {
        await add({ title, description, participants, place, supplies, remarks, start, end });
        router.replace("/(tabs)/calendar" as any);
      } else {
        await update(id!, { title, description, participants, place, supplies, remarks, start, end });
        Alert.alert("저장 완료", "일정이 저장되었습니다.");
        router.replace("/(tabs)/calendar" as any);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "일정을 저장하지 못했습니다.";
      Alert.alert("오류", message);
    }
  };

  const onDelete = () => {
    if (!id) return;
    Alert.alert("삭제", "이 일정을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(id);
            router.back();
          } catch (err) {
            const message = err instanceof Error ? err.message : "일정을 삭제하지 못했습니다.";
            Alert.alert("오류", message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={['#05081c', '#0c1b40', '#183472']}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(200, 230, 255, 0.12)', 'rgba(168, 141, 255, 0.08)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />
      </View>

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{heroSub}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(480)} style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(110, 180, 255, 0.3)', 'rgba(85, 70, 220, 0.28)', 'rgba(20, 16, 60, 0.65)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Text style={styles.heroLabel}>{heroSub}</Text>
          <Text style={styles.heroTitle}>{heroHeadline}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMetaLabel}>시작</Text>
            <Text style={styles.heroMetaValue}>{formattedStart}</Text>
          </View>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMetaLabel}>종료</Text>
            <Text style={styles.heroMetaValue}>{formattedEnd}</Text>
          </View>
        </Animated.View>

        <View style={styles.formCard}>
          <LinearGradient
            colors={['rgba(30, 40, 72, 0.92)', 'rgba(16, 24, 48, 0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formCardBackground}
            pointerEvents="none"
          />
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <Input
            label="제목"
            placeholder="예: 스터디 모임"
            value={title}
            onChangeText={setTitle}
            error={submitted ? errors.title : undefined}
            returnKeyType="next"
          />
          <Input
            label="내용"
            placeholder="자세한 내용"
            value={description}
            onChangeText={setDescription}
            multiline
            style={{ minHeight: 120 }}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formCard}>
          <LinearGradient
            colors={['rgba(30, 40, 72, 0.92)', 'rgba(16, 24, 48, 0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formCardBackground}
            pointerEvents="none"
          />
          <Text style={styles.sectionTitle}>상세 정보</Text>
          <Input label="참여자" placeholder="쉼표로 구분" value={participants} onChangeText={setParticipants} />
          <Input label="장소" placeholder="예: 강남 카페" value={place} onChangeText={setPlace} />
          <Input label="준비물" placeholder="예: 노트북, 필기도구" value={supplies} onChangeText={setSupplies} />
          <Input label="비고" placeholder="기타 메모" value={remarks} onChangeText={setRemarks} />
        </View>

        <DateTimeRangeCard
          startISO={start}
          endISO={end}
          onStartChange={setStart}
          onEndChange={setEnd}
          startError={submitted ? errors.start : undefined}
          endError={submitted ? errors.end : undefined}
          rangeError={submitted ? errors.range : undefined}
        />

        <View style={styles.actionBar}>
          <LinearGradient
            colors={['rgba(18, 28, 58, 0.96)', 'rgba(10, 16, 36, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBackground}
            pointerEvents="none"
          />
          {!isNew ? (
            <GameButton variant="secondary" onPress={onDelete} style={styles.actionButton}>
              삭제
            </GameButton>
          ) : null}
          <GameButton onPress={onSave} style={styles.actionButton}>
            저장
          </GameButton>
        </View>
        <View style={{ height: tokens.spacing.xl }} />
      </ScrollView>
    </View>
  );
}

type DateTimeRangeCardProps = {
  startISO: string;
  endISO: string;
  onStartChange: (next: string) => void;
  onEndChange: (next: string) => void;
  startError?: string;
  endError?: string;
  rangeError?: string;
};

function DateTimeRangeCard({
  startISO,
  endISO,
  onStartChange,
  onEndChange,
  startError,
  endError,
  rangeError,
}: DateTimeRangeCardProps) {
  const startDate = React.useMemo(() => parseIsoOrNow(startISO), [startISO]);
  const endDate = React.useMemo(() => parseIsoOrNow(endISO), [endISO]);
  const [activeField, setActiveField] = React.useState<'start' | 'end'>('start');

  const activeDate = activeField === 'start' ? startDate : endDate;

  const [cursor, setCursor] = React.useState(() =>
    new Date(activeDate.getFullYear(), activeDate.getMonth(), 1),
  );

  React.useEffect(() => {
    const next = activeField === 'start' ? startDate : endDate;
    setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
  }, [activeField, startDate, endDate]);

  const grid = React.useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const selectDay = React.useCallback(
    (day: Date) => {
      const current = new Date(activeDate);
      current.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      current.setSeconds(0, 0);

      if (activeField === 'start') {
        const nextStart = toLocalISO(current);
        onStartChange(nextStart);

        const existingEnd = parseIsoOrNow(endISO);
        if (current.getTime() > existingEnd.getTime()) {
          const adjusted = new Date(current);
          adjusted.setHours(adjusted.getHours() + 1);
          onEndChange(toLocalISO(adjusted));
        }
        setActiveField('end');
      } else {
        const alignedEnd = new Date(current);
        const minEnd = parseIsoOrNow(startISO);
        if (alignedEnd.getTime() < minEnd.getTime()) {
          alignedEnd.setTime(minEnd.getTime());
        }
        onEndChange(toLocalISO(alignedEnd));
      }
    },
    [activeDate, activeField, endISO, onEndChange, onStartChange, startISO],
  );

  const adjustTime = React.useCallback(
    (field: 'start' | 'end', unit: 'hour' | 'minute', delta: number) => {
      const reference = field === 'start' ? parseIsoOrNow(startISO) : parseIsoOrNow(endISO);
      if (Number.isNaN(reference.getTime())) return;
      const next = new Date(reference);
      if (unit === 'hour') {
        next.setHours(next.getHours() + delta);
      } else {
        next.setMinutes(next.getMinutes() + delta);
      }
      next.setSeconds(0, 0);

      if (field === 'start') {
        const nextStart = toLocalISO(next);
        onStartChange(nextStart);
        const existingEnd = parseIsoOrNow(endISO);
        if (next.getTime() > existingEnd.getTime()) {
          const adjusted = new Date(next);
          adjusted.setHours(adjusted.getHours() + 1);
          onEndChange(toLocalISO(adjusted));
        }
      } else {
        const minEnd = parseIsoOrNow(startISO);
        if (next.getTime() < minEnd.getTime()) {
          next.setTime(minEnd.getTime());
        }
        onEndChange(toLocalISO(next));
      }
    },
    [endISO, onEndChange, onStartChange, startISO],
  );

  const renderCell = React.useCallback(
    (day: Date) => {
      const key = dayKey(day);
      const inMonth = day.getMonth() === cursor.getMonth();
      const isStart = isSameCalendarDay(day, startDate);
      const isEnd = isSameCalendarDay(day, endDate);
      const min = Math.min(startDate.getTime(), endDate.getTime());
      const max = Math.max(startDate.getTime(), endDate.getTime());
      const inRange = day.getTime() > min && day.getTime() < max;
      const isActive = (activeField === 'start' && isStart) || (activeField === 'end' && isEnd);
      return (
        <Pressable
          key={key}
          onPress={() => selectDay(day)}
          style={({ pressed }) => [
            styles.calendarCell,
            !inMonth && styles.calendarCellOut,
            inRange && styles.calendarCellRange,
            (isStart || isEnd) && styles.calendarCellSelected,
            isActive && styles.calendarCellActive,
            pressed && styles.calendarCellPressed,
          ]}
        >
          <Text style={styles.calendarCellText}>{day.getDate()}</Text>
          {isStart ? <Text style={styles.calendarBadge}>시작</Text> : null}
          {isEnd ? <Text style={styles.calendarBadge}>종료</Text> : null}
        </Pressable>
      );
    },
    [activeField, cursor, endDate, selectDay, startDate],
  );

  const hoursLabel = twoDigits(activeDate.getHours());
  const minutesLabel = twoDigits(activeDate.getMinutes());

  return (
    <View style={styles.formCard}>
      <LinearGradient
        colors={['rgba(30, 40, 72, 0.92)', 'rgba(16, 24, 48, 0.88)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.formCardBackground}
        pointerEvents="none"
      />
      <Text style={styles.sectionTitle}>일정</Text>

      <View style={styles.rangeTabs}>
        <DateFieldTab
          label="시작"
          value={formatDisplay(startDate)}
          active={activeField === 'start'}
          onPress={() => setActiveField('start')}
          error={startError}
        />
        <DateFieldTab
          label="종료"
          value={formatDisplay(endDate)}
          active={activeField === 'end'}
          onPress={() => setActiveField('end')}
          error={endError}
        />
      </View>

      <View style={styles.calendarHeader}>
        <Pressable onPress={() => setCursor(prevMonth(cursor))} style={styles.calendarNavButton}>
          <Text style={styles.calendarNavIcon}>←</Text>
        </Pressable>
        <Text style={styles.calendarTitle}>{formatMonthYear(cursor)}</Text>
        <Pressable onPress={() => setCursor(nextMonth(cursor))} style={styles.calendarNavButton}>
          <Text style={styles.calendarNavIcon}>→</Text>
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEK_LABELS.map((label) => (
          <Text key={label} style={styles.weekLabel}>{label}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {grid.map((day) => renderCell(day))}
      </View>

      <View style={styles.timeControls}>
        <Text style={styles.timeHeading}>{activeField === 'start' ? '시작 시간' : '종료 시간'}</Text>
        <View style={styles.timeControlRow}>
          <TimeAdjust
            label="시"
            value={hoursLabel}
            onDecrease={() => adjustTime(activeField, 'hour', -1)}
            onIncrease={() => adjustTime(activeField, 'hour', 1)}
          />
          <TimeAdjust
            label="분"
            value={minutesLabel}
            onDecrease={() => adjustTime(activeField, 'minute', -15)}
            onIncrease={() => adjustTime(activeField, 'minute', 15)}
          />
        </View>
      </View>

      {rangeError ? <Text style={styles.rangeError}>{rangeError}</Text> : null}
    </View>
  );
}

type DateFieldTabProps = {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
  error?: string;
};

function DateFieldTab({ label, value, active, onPress, error }: DateFieldTabProps) {
  return (
    <Pressable onPress={onPress} style={[styles.rangeTab, active && styles.rangeTabActive]}>
      <Text style={styles.rangeTabLabel}>{label}</Text>
      <Text style={styles.rangeTabValue}>{value}</Text>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </Pressable>
  );
}

type TimeAdjustProps = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

function TimeAdjust({ label, value, onDecrease, onIncrease }: TimeAdjustProps) {
  return (
    <View style={styles.timeControlGroup}>
      <Text style={styles.timeControlLabel}>{label}</Text>
      <View style={styles.timeAdjustRow}>
        <Pressable onPress={onDecrease} style={styles.timeButton}>
          <Text style={styles.timeButtonText}>-</Text>
        </Pressable>
        <Text style={styles.timeValue}>{value}</Text>
        <Pressable onPress={onIncrease} style={styles.timeButton}>
          <Text style={styles.timeButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function parseIsoOrNow(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

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

function prevMonth(cursor: Date) {
  return new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
}

function nextMonth(cursor: Date) {
  return new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
}

function formatMonthYear(cursor: Date) {
  return `${cursor.getFullYear()}.${twoDigits(cursor.getMonth() + 1)}`;
}

function formatDisplay(date: Date) {
  return `${twoDigits(date.getMonth() + 1)}.${twoDigits(date.getDate())} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

function twoDigits(n: number) {
  return `${n}`.padStart(2, '0');
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

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
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  orbOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: 'rgba(98, 177, 255, 0.22)',
    top: -50,
    right: -60,
    shadowColor: '#63d1f8',
    shadowOpacity: 0.35,
    shadowRadius: 90,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  orbTwo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: 'rgba(160, 120, 255, 0.22)',
    bottom: -80,
    left: -40,
    shadowColor: '#a88eff',
    shadowOpacity: 0.3,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  safeArea: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(110, 150, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 24, 52, 0.75)',
    shadowColor: '#63d1f8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  backIcon: {
    color: tokens.colors.text.primary,
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#eef5ff',
    fontSize: 30,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.6,
  },
  headerSpacer: { width: 46, height: 46 },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  heroCard: {
    padding: tokens.spacing.xl,
    borderRadius: tokens.radii.xl * 1.1,
    borderWidth: 1,
    borderColor: 'rgba(120, 180, 255, 0.35)',
    backgroundColor: 'rgba(16, 28, 58, 0.72)',
    overflow: 'hidden',
    shadowColor: '#5DC2F2',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  heroLabel: {
    color: '#cde7ff',
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.light,
    letterSpacing: 0.6,
    marginBottom: tokens.spacing.xs,
  },
  heroTitle: {
    color: '#f6f8ff',
    fontSize: 32,
    fontFamily: tokens.typography.fontFamily.bold,
    lineHeight: 34,
    letterSpacing: 0.4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(200, 220, 255, 0.25)',
    marginVertical: tokens.spacing.sm,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.xs,
  },
  heroMetaLabel: {
    color: '#bcd6ff',
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  heroMetaValue: {
    color: tokens.colors.text.primary,
    fontSize: 20,
    fontFamily: tokens.typography.fontFamily.regular,
    letterSpacing: 0.4,
  },
  formCard: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.xl * 1.05,
    borderWidth: 1,
    borderColor: 'rgba(130, 170, 255, 0.22)',
    backgroundColor: 'rgba(16, 28, 58, 0.72)',
    overflow: 'hidden',
    gap: tokens.spacing.md,
    shadowColor: '#070a18',
    shadowOpacity: 0.32,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  formCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionTitle: {
    color: '#cfe0ff',
    fontSize: 22,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  rangeTabs: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  rangeTab: {
    flex: 1,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(120, 180, 255, 0.25)',
    backgroundColor: 'rgba(10, 16, 34, 0.7)',
    gap: 4,
  },
  rangeTabActive: {
    borderColor: 'rgba(170, 210, 255, 0.85)',
    backgroundColor: 'rgba(40, 60, 120, 0.7)',
    shadowColor: '#5DC2F2',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  rangeTabLabel: {
    color: '#bcd6ff',
    fontSize: 16,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.3,
  },
  rangeTabValue: {
    color: tokens.colors.text.primary,
    fontSize: 20,
    fontFamily: tokens.typography.fontFamily.regular,
    letterSpacing: 0.3,
  },
  fieldErrorText: {
    marginTop: 2,
    color: tokens.colors.state.error,
    fontSize: 14,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.xs,
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(130, 170, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 20, 44, 0.76)',
  },
  calendarNavIcon: {
    color: '#d4e4ff',
    fontSize: 20,
  },
  calendarTitle: {
    color: '#eef5ff',
    fontSize: 22,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
    paddingHorizontal: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#a9baf0',
    fontSize: 16,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: tokens.spacing.md,
  },
  calendarCell: {
    width: '13.5%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 20, 44, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(120, 150, 220, 0.18)',
    gap: 4,
  },
  calendarCellOut: {
    opacity: 0.35,
  },
  calendarCellRange: {
    backgroundColor: 'rgba(90, 120, 200, 0.45)',
  },
  calendarCellSelected: {
    borderColor: 'rgba(190, 225, 255, 0.95)',
    backgroundColor: 'rgba(80, 120, 210, 0.55)',
  },
  calendarCellActive: {
    shadowColor: '#5DC2F2',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  calendarCellPressed: {
    transform: [{ scale: 0.97 }],
  },
  calendarCellText: {
    color: '#f6f8ff',
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  calendarBadge: {
    fontSize: 12,
    color: 'rgba(240, 248, 255, 0.85)',
    fontFamily: tokens.typography.fontFamily.light,
    letterSpacing: 0.2,
  },
  timeControls: {
    gap: tokens.spacing.sm,
  },
  timeHeading: {
    color: '#cfe0ff',
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.3,
  },
  timeControlRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  timeControlGroup: {
    flex: 1,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(120, 170, 255, 0.25)',
    backgroundColor: 'rgba(10, 16, 34, 0.7)',
    padding: tokens.spacing.xs,
    gap: 6,
  },
  timeControlLabel: {
    color: '#bcd6ff',
    fontSize: 16,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  timeAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140, 190, 255, 0.35)',
    backgroundColor: 'rgba(18, 26, 52, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    color: '#eef5ff',
    fontSize: 22,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  timeValue: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.text.primary,
    fontSize: 24,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.3,
  },
  rangeError: {
    marginTop: tokens.spacing.sm,
    color: tokens.colors.state.error,
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  actionBar: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(130, 170, 255, 0.28)',
    overflow: 'hidden',
    shadowColor: '#050814',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  actionBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  actionButton: {
    flex: 1,
  },
});
