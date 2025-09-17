import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import tokens from '../../../theme/tokens';
import { FriendList } from '../../../components/friends/FriendList';
import { FriendRequests } from '../../../components/friends/FriendRequests';
import { FriendSearch } from '../../../components/friends/FriendSearch';

const AnimatedPressable = Animated.createAnimatedComponent(View);

const TAB_META: { key: 'list' | 'requests' | 'search'; label: string; helper: string }[] = [
  { key: 'list', label: '길드원', helper: '함께 모험 중인 친구들' },
  { key: 'requests', label: '길드 초대', helper: '들어온 초대를 확인해요' },
  { key: 'search', label: '새 친구', helper: '이메일로 모험 동료 초대' },
];

export default function FriendsIndex() {
  const [activeTab, setActiveTab] = React.useState<'list' | 'requests' | 'search'>('list');

  const renderContent = () => {
    if (activeTab === 'requests') return <FriendRequests />;
    if (activeTab === 'search') return <FriendSearch />;
    return <FriendList />;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={tokens.colors.gradients.dusk}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.title}>길드 광장</Text>
        <Text style={styles.subtitle}>따뜻한 불빛 아래에서 함께할 친구들을 초대해요.</Text>
        <View style={styles.tabs}>
          {TAB_META.map((tab, index) => {
            const isActive = activeTab === tab.key;
            return (
              <AnimatedPressable
                key={tab.key}
                entering={FadeInDown.delay(index * 60)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                <Text style={[styles.tabHelper, isActive && styles.tabHelperActive]}>{tab.helper}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </SafeAreaView>
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  safeArea: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  title: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.xl,
    fontFamily: tokens.typography.fontFamily.bold,
    letterSpacing: 1,
  },
  subtitle: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.sm,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.md,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
    backgroundColor: 'rgba(30, 32, 55, 0.65)',
  },
  tabButtonActive: {
    borderColor: tokens.colors.highlight,
    backgroundColor: 'rgba(102, 132, 255, 0.28)',
  },
  tabLabel: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  tabLabelActive: {
    color: tokens.colors.text.primary,
  },
  tabHelper: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.xs,
    marginTop: 4,
  },
  tabHelperActive: {
    color: tokens.colors.text.secondary,
  },
  content: {
    flex: 1,
  },
});
