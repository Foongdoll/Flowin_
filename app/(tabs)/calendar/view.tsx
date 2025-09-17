import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import tokens from '../../../theme/tokens';
import { useCalendar } from '../../../components/provider/CalendarProvider';
import { GameButton } from '../../../components/ui/GameButton';

const AnimatedScroll = Animated.createAnimatedComponent(ScrollView);

export default function ViewEvent() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const eventId = typeof id === 'string' ? id : undefined;
  const { get, fetchById, remove } = useCalendar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const event = useMemo(() => (eventId ? get(eventId) : undefined), [eventId, get]);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError('일정을 찾을 수 없습니다.');
      return;
    }
    if (event) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchById(eventId)
      .then(() => setLoading(false))
      .catch((err) => {
        const message = err instanceof Error ? err.message : '일정을 불러오지 못했어요.';
        setError(message);
        setLoading(false);
      });
  }, [eventId, event, fetchById]);

  const goBackToCalendar = () => {
    router.replace('/(tabs)/calendar');
  };

  const goEdit = () => {
    if (!eventId) return;
    router.push({ pathname: '/(tabs)/calendar/edit', params: { id: eventId } });
  };

  const confirmDelete = () => {
    if (!eventId) return;
    Alert.alert('삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(eventId);
            goBackToCalendar();
          } catch (err) {
            const message = err instanceof Error ? err.message : '일정을 삭제하지 못했어요.';
            Alert.alert('오류', message);
          }
        },
      },
    ]);
  };

  const detail = eventId ? event || null : null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={tokens.colors.gradients.sky}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={goBackToCalendar} style={styles.backButton}>
            <Text style={styles.backIcon}>{'‹'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>일정 정보</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.accent} />
          <Text style={styles.helperText}>일정을 불러오는 중이에요…</Text>
        </View>
      ) : error || !detail ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || '일정을 찾을 수 없어요.'}</Text>
          <GameButton variant="secondary" onPress={goBackToCalendar} style={styles.retryButton}>
            캘린더로 돌아가기
          </GameButton>
        </View>
      ) : (
        <AnimatedScroll
          entering={FadeInDown.duration(tokens.motion.timing.slow)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <InfoCard label="제목" value={detail.title} highlight />
          <InfoCard label="기간" value={formatRange(detail.start, detail.end)} />
          <InfoCard label="장소" value={detail.place || '장소 정보 없음'} />
          <InfoCard label="참여자" value={detail.participants || '미정'} />
          <InfoCard label="준비물" value={detail.supplies || '없음'} />
          <InfoCard label="비고" value={detail.remarks || '메모가 없어요.'} multiline />
          <InfoCard label="설명" value={detail.description || '준비된 설명이 없어요.'} multiline />
          <View style={styles.actions}>
            <GameButton variant="secondary" onPress={goEdit} style={styles.actionButton}>
              일정 수정하기
            </GameButton>
            <GameButton variant="primary" onPress={confirmDelete} style={styles.deleteButton}>
              일정 삭제
            </GameButton>
          </View>
        </AnimatedScroll>
      )}
    </View>
  );
}

function InfoCard({
  label,
  value,
  multiline,
  highlight,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight, multiline && styles.cardMultiline]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, multiline && styles.cardValueMultiline]}>{value}</Text>
    </View>
  );
}

function formatRange(startISO: string, endISO: string) {
  try {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const pad = (n: number) => `${n}`.padStart(2, '0');
    const startStr = `${start.getFullYear()}.${pad(start.getMonth() + 1)}.${pad(start.getDate())} ${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endStr = `${end.getFullYear()}.${pad(end.getMonth() + 1)}.${pad(end.getDate())} ${pad(end.getHours())}:${pad(end.getMinutes())}`;
    return `${startStr} ~ ${endStr}`;
  } catch {
    return `${startISO} ~ ${endISO}`;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  safeArea: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.surface,
  },
  backIcon: {
    color: tokens.colors.text.primary,
    fontSize: 26,
    lineHeight: 26,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.lg,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 1.5,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  helperText: {
    color: tokens.colors.text.secondary,
  },
  errorText: {
    color: tokens.colors.state.error,
    textAlign: 'center',
    fontSize: tokens.typography.size.md,
  },
  retryButton: {
    minWidth: 180,
  },
  content: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
    gap: tokens.spacing.md,
  },
  card: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
    backgroundColor: 'rgba(32, 44, 70, 0.68)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHighlight: {
    backgroundColor: 'rgba(108, 152, 255, 0.25)',
    borderColor: tokens.colors.highlight,
  },
  cardMultiline: {
    minHeight: 120,
  },
  cardLabel: {
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
    fontSize: tokens.typography.size.sm,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  cardValue: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
  },
  cardValueMultiline: {
    lineHeight: tokens.typography.lineHeight.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
});
