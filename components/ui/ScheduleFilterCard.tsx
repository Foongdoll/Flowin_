import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { format } from 'date-fns';
import { GameButton } from './GameButton';
import tokens from '../../theme/tokens';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ScheduleFilterCardProps {
  onSearch: (params: {
    searchTerm: string;
    dateRange: DateRange;
    sortBy: 'date' | 'priority' | 'title';
  }) => void;
}

const AnimatedCard = Animated.createAnimatedComponent(View);

const helperText = {
  search: 'Enter at least two characters to filter.',
  dates: 'Start date must not be later than end date.'
};

export const ScheduleFilterCard: React.FC<ScheduleFilterCardProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [sortBy, setSortBy] = React.useState<'date' | 'priority' | 'title'>('date');
  const [errors, setErrors] = React.useState<{ search?: string; dates?: string }>({});
  const [focusedField, setFocusedField] = React.useState<'search' | 'start' | 'end' | null>(null);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const validate = React.useCallback(() => {
    const nextErrors: typeof errors = {};
    if (searchTerm.trim().length < 2) {
      nextErrors.search = helperText.search;
    }
    if (dateRange.endDate < dateRange.startDate) {
      nextErrors.dates = helperText.dates;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [dateRange.endDate, dateRange.startDate, searchTerm]);

  const handleSubmit = React.useCallback(() => {
    if (!validate()) return;
    scale.value = withSpring(0.96, tokens.motion.spring.snappy);
    onSearch({ searchTerm, dateRange, sortBy });
    scale.value = withSpring(1, tokens.motion.spring.bouncy);
  }, [dateRange, onSearch, scale, searchTerm, sortBy, validate]);

  const handleDatePress = React.useCallback((field: 'start' | 'end') => {
    setFocusedField(field);
    setDateRange((prev) => {
      const delta = field === 'start' ? -1 : 1;
      const next = new Date(field === 'start' ? prev.startDate : prev.endDate);
      next.setDate(next.getDate() + delta);
      if (field === 'start') {
        return {
          ...prev,
          startDate: next,
          endDate: next > prev.endDate ? next : prev.endDate,
        };
      }
      return {
        ...prev,
        endDate: next,
      };
    });
    if (Platform.OS === 'web') {
      return;
    }
  }, []);

  return (
    <AnimatedCard
      accessibilityRole="summary" // 혹은 "none" / "header" 용도에 맞게
      accessibilityLabel="날짜 범위 설정 섹션"
      accessibilityHint="시작일과 종료일을 선택합니다."
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.section}>
        <Text style={styles.label}>Search schedules</Text>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Title or tag"
          placeholderTextColor={tokens.colors.text.muted}
          onFocus={() => setFocusedField('search')}
          onBlur={() => setFocusedField(null)}
          accessibilityHint="Enter a keyword to filter the schedule list."
          style={[
            styles.input,
            focusedField === 'search' && styles.focused,
            errors.search && styles.errorBorder
          ]}
        />
        <Text style={styles.helper}>
          {errors.search ? errors.search : helperText.search}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date range</Text>
        <View style={styles.rangeRow}>
          <GameButton
            accessibilityHint="Adjust the start date."
            variant={focusedField === 'start' ? 'primary' : 'secondary'}
            style={[
              styles.dateButton,
              focusedField === 'start' && styles.focused,
              errors.dates && styles.errorBorder
            ]}
            onPress={() => handleDatePress('start')}
          >
            {format(dateRange.startDate, 'MMM dd')}
          </GameButton>
          <Text style={styles.rangeSeparator}>to</Text>
          <GameButton
            accessibilityHint="Adjust the end date."
            variant={focusedField === 'end' ? 'primary' : 'secondary'}
            style={[
              styles.dateButton,
              focusedField === 'end' && styles.focused,
              errors.dates && styles.errorBorder
            ]}
            onPress={() => handleDatePress('end')}
          >
            {format(dateRange.endDate, 'MMM dd')}
          </GameButton>
        </View>
        <Text style={styles.helper}>
          {errors.dates ? errors.dates : helperText.dates}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sort by</Text>
        <View style={styles.sortRow}>
          {(['date', 'priority', 'title'] as const).map((option) => (
            <GameButton
              key={option}
              variant={sortBy === option ? 'primary' : 'secondary'}
              onPress={() => setSortBy(option)}
              accessibilityHint={`Sort by ${option}.`}
              style={styles.sortButton}
            >
              {option === 'date' && 'Date'}
              {option === 'priority' && 'Priority'}
              {option === 'title' && 'Title'}
            </GameButton>
          ))}
        </View>
      </View>

      <GameButton
        onPress={handleSubmit}
        accessibilityHint="Apply the selected filters."
        style={styles.submitButton}
      >
        Apply filters
      </GameButton>
    </AnimatedCard >
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.card,
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.borders.pixel.borderColor,
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
    ...tokens.shadows.soft,
  },
  section: {
    gap: tokens.spacing.xs,
  },
  label: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.sm,
    letterSpacing: 0.5,
  },
  helper: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.xs,
  },
  input: {
    width: '100%',
    minHeight: 44,
    borderRadius: tokens.radii.md,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.borders.pixel.borderColor,
    backgroundColor: tokens.colors.surface,
    color: tokens.colors.text.primary,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    fontSize: tokens.typography.size.md,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  dateButton: {
    flex: 1,
  },
  rangeSeparator: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.md,
  },
  sortRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  sortButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: tokens.spacing.sm,
  },
  focused: {
    borderColor: tokens.colors.highlight,
    shadowColor: tokens.colors.highlight,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  errorBorder: {
    borderColor: tokens.colors.state.error,
  },
});
