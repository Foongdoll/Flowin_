import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import tokens from '../../theme/tokens';
import { GameButton } from '../ui/GameButton';
import {
  FriendRequest,
  User,
  firebaseFetchPending,
  firebaseRespondFriendRequest,
  getMockUserById,
  subscribeToFriendRequests,
} from '../../mocks/friends';

const AnimatedCard = Animated.createAnimatedComponent(View);
const CURRENT_USER_ID = 'u1';

type RichRequest = FriendRequest & { sender?: User; receiver?: User };

export function FriendRequests() {
  const [requests, setRequests] = React.useState<RichRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const enhance = React.useCallback((snapshot: FriendRequest[]): RichRequest[] => {
    return snapshot.map((request) => ({
      ...request,
      sender: getMockUserById(request.senderId) ?? undefined,
      receiver: getMockUserById(request.receiverId) ?? undefined,
    }));
  }, []);

  const loadRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const initial = await firebaseFetchPending(CURRENT_USER_ID);
      setRequests(enhance(initial));
    } finally {
      setLoading(false);
    }
  }, [enhance]);

  React.useEffect(() => {
    loadRequests();
    const unsubscribe = subscribeToFriendRequests(CURRENT_USER_ID, (snapshot) => {
      setRequests(enhance(snapshot));
    });
    return () => unsubscribe();
  }, [enhance, loadRequests]);

  const handleResponse = React.useCallback(async (requestId: string, status: 'accepted' | 'rejected') => {
    await firebaseRespondFriendRequest(requestId, status);
  }, []);

  return (
    <View style={styles.container}>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>{loading ? '초대 소식을 모으는 중…' : '대기 중인 초대가 없어요.'}</Text>
      ) : (
        requests.map((request, index) => (
          <AnimatedCard
            key={request.id}
            entering={FadeInDown.delay(index * 60).springify().damping(18)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.requester}>{request.sender?.displayName ?? '알 수 없음'}</Text>
                <Text style={styles.requesterMail}>{request.sender?.email ?? '-'}</Text>
              </View>
              <Text style={styles.timestamp}>{new Date(request.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.helper}>@{request.sender?.username ?? 'unknown'} 님이 파티 합류를 요청했어요.</Text>
            <View style={styles.actions}>
              <GameButton onPress={() => handleResponse(request.id, 'accepted')} style={styles.actionButton}>
                수락하기
              </GameButton>
              <GameButton variant="secondary" onPress={() => handleResponse(request.id, 'rejected')} style={styles.actionButton}>
                보류
              </GameButton>
            </View>
          </AnimatedCard>
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
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
    backgroundColor: 'rgba(36, 44, 78, 0.7)',
    gap: tokens.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requester: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  requesterMail: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.xs,
    marginTop: 4,
  },
  timestamp: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.xs,
  },
  helper: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.sm,
    marginTop: tokens.spacing.lg,
  },
});
