import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import tokens from '../../theme/tokens';
import { GameButton } from '../ui/GameButton';
import {
  User,
  firebaseFetchFriends,
  subscribeToFriendList,
} from '../../mocks/friends';

const AnimatedView = Animated.createAnimatedComponent(View);
const CURRENT_USER_ID = 'u1';

export function FriendList() {
  const [friends, setFriends] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadFriends = React.useCallback(async () => {
    setLoading(true);
    try {
      const initial = await firebaseFetchFriends(CURRENT_USER_ID);
      setFriends(initial);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFriends();
    const unsubscribe = subscribeToFriendList(CURRENT_USER_ID, (snapshot) => {
      setFriends(snapshot);
    });
    return () => unsubscribe();
  }, [loadFriends]);

  return (
    <View style={styles.container}>
      {friends.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>{loading ? '길드원을 부르고 있어요…' : '아직 함께할 친구가 없어요.'}</Text>
          <Text style={styles.emptyText}>아래에서 친구를 초대하고 모험을 떠나보세요.</Text>
          <GameButton variant="secondary" onPress={loadFriends} style={styles.refreshButton}>
            새로 고침
          </GameButton>
        </View>
      ) : (
        friends.map((friend, index) => (
          <AnimatedView
            key={friend.id}
            entering={FadeInUp.delay(index * 60).springify().damping(18)}
            style={styles.card}
          >
            <View>
              <Text style={styles.friendName}>{friend.displayName}</Text>
              <Text style={styles.friendMail}>{friend.email}</Text>
            </View>
            <Text style={styles.friendHandle}>@{friend.username}</Text>
          </AnimatedView>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  card: {
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.thin.borderWidth,
    borderColor: tokens.colors.highlight,
    backgroundColor: 'rgba(52, 64, 102, 0.55)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  friendName: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  friendMail: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.xs,
    marginTop: 4,
  },
  friendHandle: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.sm,
  },
  emptyBox: {
    backgroundColor: 'rgba(30, 40, 65, 0.6)',
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    gap: tokens.spacing.sm,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
  },
  emptyTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.bold,
  },
  emptyText: {
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    fontSize: tokens.typography.size.sm,
  },
  refreshButton: {
    marginTop: tokens.spacing.sm,
  },
});
