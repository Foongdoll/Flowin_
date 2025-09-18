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
import AmbientBackdrop from '@/components/ui/AmbientBackdrop';
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
      <AmbientBackdrop />
      <LinearGradient
        colors={['rgba(5, 8, 24, 0.82)', 'rgba(8, 12, 28, 0.88)', 'rgba(10, 14, 30, 0.92)'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top Bar */}
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={goBackToCalendar}
            style={styles.backButton}
            hitSlop={12}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>일정</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* Body */}
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
        <>
          {/* Hero Card */}
          <Animated.View entering={FadeInDown.duration(520)} style={styles.heroCard}>
            <LinearGradient
              colors={[
                'rgba(120, 180, 255, 0.26)',
                'rgba(116, 110, 255, 0.20)',
                'rgba(36, 18, 72, 0.45)',
              ] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
              pointerEvents="none"
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadgeRow}>
                <Badge text={isSameDay(detail.start, detail.end) ? '하루 일정' : '멀티데이'} />
                <Badge text={isPast(detail.end) ? '종료됨' : '예정'} tone={isPast(detail.end) ? 'warn' : 'ok'} />
              </View>
              <Text numberOfLines={2} style={styles.heroTitle}>
                {detail.title || '제목 없음'}
              </Text>
              <View style={styles.heroMetaRow}>
                <Text style={styles.heroWhen}>{formatRange(detail.start, detail.end)}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Scroll Content */}
          <AnimatedScroll
            entering={FadeInDown.delay(80).duration(600)}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Section label="장소" icon="📍" value={detail.place || '장소 정보 없음'} />
            <Section label="참여자" icon="🧑‍🤝‍🧑" value={detail.participants || '미정'} />
            <Section label="준비물" icon="🎒" value={detail.supplies || '없음'} />
            <Section label="비고" icon="📝" value={detail.remarks || '메모가 없어요.'} multiline />
            <Section label="설명" icon="✨" value={detail.description || '준비된 설명이 없어요.'} multiline last />
            <View style={{ height: 88 }} />
          </AnimatedScroll>

          {/* Sticky Action Bar */}
          <View style={styles.footerBar}>
            <LinearGradient
              colors={['rgba(16,24,52,0.92)', 'rgba(8,12,28,0.88)'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.footerBackground}
              pointerEvents="none"
            />
            <GameButton variant="secondary" onPress={goEdit} style={styles.footerBtn}>
              수정하기
            </GameButton>
            <GameButton variant="primary" onPress={confirmDelete} style={styles.footerBtn}>
              삭제
            </GameButton>
          </View>
        </>
      )}
    </View>
  );
}

/* ----------------- UI bits ----------------- */

function Badge({ text, tone = 'info' }: { text: string; tone?: 'info' | 'ok' | 'warn' }) {
  const map = {
    info: {
      gradient: ['rgba(120, 200, 255, 0.55)', 'rgba(124, 160, 255, 0.22)'] as const,
      text: '#EAF4FF',
      border: 'rgba(120, 200, 255, 0.55)',
    },
    ok: {
      gradient: ['rgba(92, 240, 185, 0.52)', 'rgba(64, 180, 150, 0.20)'] as const,
      text: '#E9FFF6',
      border: 'rgba(92, 240, 185, 0.5)',
    },
    warn: {
      gradient: ['rgba(255, 170, 170, 0.52)', 'rgba(180, 80, 80, 0.18)'] as const,
      text: '#FFE9E9',
      border: 'rgba(255, 170, 170, 0.5)',
    },
  }[tone];

  return (
    <LinearGradient
      colors={map.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, { borderColor: map.border }]}
    >
      <Text style={[styles.badgeText, { color: map.text }]}>{text}</Text>
    </LinearGradient>
  );
}

function Section({
  label,
  icon,
  value,
  multiline,
  last,
}: {
  label: string;
  icon: string;
  value: string;
  multiline?: boolean;
  last?: boolean;
}) {
  const accentColor = SECTION_ACCENTS[label] ?? 'rgba(125, 160, 255, 0.45)';

  return (
    <View style={[styles.card, multiline && styles.cardMultiline, last && styles.cardLast]}>
      <LinearGradient
        colors={['rgba(28,38,72,0.95)', 'rgba(14,20,42,0.88)'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardBackground}
        pointerEvents="none"
      />
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <Text
        style={[styles.cardValue, multiline && styles.cardValueMultiline]}
        numberOfLines={multiline ? 0 : 3}
      >
        {value}
      </Text>
    </View>
  );
}

/* ----------------- utils ----------------- */

function two(n: number) {
  return `${n}`.padStart(2, '0');
}
function isSameDay(aISO: string, bISO: string) {
  const a = new Date(aISO);
  const b = new Date(bISO);
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isPast(endISO: string) {
  return new Date(endISO).getTime() < Date.now();
}
function formatRange(startISO: string, endISO: string) {
  try {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const s = `${start.getFullYear()}.${two(start.getMonth() + 1)}.${two(start.getDate())} ${two(start.getHours())}:${two(start.getMinutes())}`;
    const e = `${end.getFullYear()}.${two(end.getMonth() + 1)}.${two(end.getDate())} ${two(end.getHours())}:${two(end.getMinutes())}`;
    return isSameDay(startISO, endISO) ? `${s} ~ ${two(end.getHours())}:${two(end.getMinutes())}` : `${s} ~ ${e}`;
  } catch {
    return `${startISO} ~ ${endISO}`;
  }
}

/* ----------------- styles ----------------- */

const SECTION_ACCENTS: Record<string, string> = {
  장소: 'rgba(115, 207, 255, 0.85)',
  참여자: 'rgba(255, 158, 204, 0.8)',
  준비물: 'rgba(255, 209, 102, 0.9)',
  비고: 'rgba(140, 255, 210, 0.85)',
  설명: 'rgba(168, 142, 255, 0.8)',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    position: 'relative',
  },

  /* header */
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
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(120, 160, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 24, 52, 0.72)',
    shadowColor: '#63d1f8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  backIcon: {
    color: tokens.colors.text.primary,
    fontSize: 26,
    lineHeight: 26,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#EEF5FF',
    fontSize: 28,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 1,
  },
  headerSpacer: { width: 44, height: 44 },

  /* hero */
  heroCard: {
    marginTop: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(120, 180, 255, 0.28)',
    backgroundColor: 'rgba(16, 28, 58, 0.70)',
    overflow: 'hidden',
    shadowColor: '#5DC2F2',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    gap: tokens.spacing.xs,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#F6F8FF',
    fontSize: 30,
    lineHeight: 30,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroWhen: {
    color: '#D6E6FF',
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.regular,
    letterSpacing: 0.3,
  },

  /* badges */
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.3,
  },

  /* content cards */
  content: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxl,
    gap: tokens.spacing.md,
  },
  card: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(130, 170, 255, 0.22)',
    backgroundColor: 'rgba(16, 28, 58, 0.70)',
    overflow: 'hidden',
    shadowColor: '#050814',
    shadowOpacity: 0.38,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardMultiline: {
    minHeight: 132,
  },
  cardLast: {
    marginBottom: 0,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardLabel: {
    color: '#CFE0FF',
    fontSize: 20,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  cardValue: {
    color: tokens.colors.text.primary,
    fontSize: 20,
    lineHeight: 26,
  },
  cardValueMultiline: {
    lineHeight: 28,
    marginTop: tokens.spacing.xs,
  },

  /* empty + error */
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  helperText: {
    color: tokens.colors.text.secondary,
    fontSize: 18,
    fontFamily: tokens.typography.fontFamily.regular,
  },
  errorText: {
    color: tokens.colors.state.error,
    textAlign: 'center',
    fontSize: 19,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  retryButton: {
    minWidth: 180,
  },

  /* footer sticky bar */
  footerBar: {
    position: 'absolute',
    left: tokens.spacing.lg,
    right: tokens.spacing.lg,
    bottom: tokens.spacing.lg,
    flexDirection: 'row',
    gap: tokens.spacing.md,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(130, 170, 255, 0.28)',
    overflow: 'hidden',
    shadowColor: '#050814',
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  footerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  footerBtn: { flex: 1 },
});
