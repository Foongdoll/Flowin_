import React from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import tokens from "../../theme/tokens";
import { GameButton } from "../ui/GameButton";
import {
  User,
  searchUsers,
  sendFriendRequest,
  sendFriendInviteByEmail,
} from "../../mocks/friends";

const AnimatedView = Animated.createAnimatedComponent(View);
const CURRENT_USER_ID = "u1";

export function FriendSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [sentRequests, setSentRequests] = React.useState<Record<string, boolean>>({});

  const handleLookup = React.useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const users = await searchUsers(query);
      setResults(users.filter((user) => user.id !== CURRENT_USER_ID));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleSendRequest = React.useCallback(async (userId: string) => {
    await sendFriendRequest(CURRENT_USER_ID, userId);
    setSentRequests((prev) => ({ ...prev, [userId]: true }));
    Alert.alert("전송 완료", "친구 요청을 보냈어요!");
  }, []);

  const handleSendByEmail = React.useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      Alert.alert("이메일 확인", "올바른 이메일 주소를 입력해주세요.");
      return;
    }
    try {
      await sendFriendInviteByEmail(CURRENT_USER_ID, trimmed);
      Alert.alert("요청 전송", `${trimmed} 님께 친구 요청을 보냈어요!`);
      setEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "요청을 보낼 수 없었어요.";
      Alert.alert("오류", message);
    }
  }, [email]);

  return (
    <View style={styles.container}>
      <View style={styles.emailCard}>
        <Text style={styles.cardTitle}>이메일로 초대하기</Text>
        <Text style={styles.cardHelper}>친구의 이메일을 입력해 길드 초대를 보내보세요.</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={styles.input}
            placeholder="friend@example.com"
            placeholderTextColor={tokens.colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="친구 이메일"
          />
          <GameButton onPress={handleSendByEmail} style={styles.inviteButton}>
            보내기
          </GameButton>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>모험가 검색</Text>
        <Text style={styles.cardHelper}>닉네임이나 태그로 찾고 싶을 때 사용하세요.</Text>
        <View style={styles.inlineRow}>
          <TextInput
            style={styles.input}
            placeholder="검색어 입력"
            placeholderTextColor={tokens.colors.text.muted}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="검색어"
            onSubmitEditing={handleLookup}
          />
          <GameButton onPress={handleLookup} disabled={loading}>
            검색
          </GameButton>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <AnimatedView
            entering={FadeInUp.delay(index * 60).springify().damping(18)}
            style={styles.resultCard}
          >
            <View>
              <Text style={styles.resultName}>{item.displayName}</Text>
              <Text style={styles.resultEmail}>{item.email}</Text>
              <Text style={styles.resultHandle}>@{item.username}</Text>
            </View>
            <GameButton
              variant={sentRequests[item.id] ? "secondary" : "primary"}
              disabled={sentRequests[item.id]}
              onPress={() => handleSendRequest(item.id)}
              accessibilityHint={`@${item.username} 님에게 친구 요청을 보냅니다.`}
            >
              {sentRequests[item.id] ? "요청 완료" : "친구 추가"}
            </GameButton>
          </AnimatedView>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "검색 중…" : "검색 결과가 아직 없어요."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
  },
  emailCard: {
    backgroundColor: 'rgba(58, 46, 74, 0.58)',
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.highlight,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  searchCard: {
    backgroundColor: 'rgba(33, 44, 76, 0.58)',
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  cardTitle: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  cardHelper: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.xs,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: tokens.radii.md,
    borderWidth: tokens.borders.pixel.borderWidth,
    borderColor: tokens.colors.border,
    backgroundColor: tokens.colors.surface,
    color: tokens.colors.text.primary,
    paddingHorizontal: tokens.spacing.md,
    fontSize: tokens.typography.size.md,
  },
  inviteButton: {
    minWidth: 96,
  },
  list: {
    gap: tokens.spacing.sm,
    paddingBottom: tokens.spacing.xxl,
  },
  resultCard: {
    backgroundColor: 'rgba(32, 45, 78, 0.55)',
    borderRadius: tokens.radii.lg,
    borderWidth: tokens.borders.thin.borderWidth,
    borderColor: tokens.colors.border,
    padding: tokens.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  resultName: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.size.md,
    fontFamily: tokens.typography.fontFamily.medium,
  },
  resultEmail: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.xs,
    marginTop: 2,
  },
  resultHandle: {
    color: tokens.colors.text.muted,
    fontSize: tokens.typography.size.sm,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.size.sm,
  },
});
