import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";
import { useAuth } from "./AuthProvider";

export type Friend = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Ctx = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addFriend: (email: string) => Promise<Friend>;
  removeFriend: (id: string) => Promise<void>;
  getFriend: (id: string) => Friend | undefined;
};

const FriendsContext = createContext<Ctx | null>(null);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setFriends([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await http("/friends", { token });
      if (Array.isArray(data)) {
        setFriends(data);
      } else {
        setFriends([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "친구 목록을 불러오지 못했습니다.";
      setError(message);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFriend = useCallback(async (email: string) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const friend = await http("/friends", { method: "POST", body: { email }, token });
    setFriends((prev) => {
      const filtered = prev.filter((item) => item.id !== friend.id);
      return [friend, ...filtered];
    });
    return friend;
  }, [token]);

  const removeFriend = useCallback(async (id: string) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    await http("/friends/" + id, { method: "DELETE", token });
    setFriends((prev) => prev.filter((item) => item.id !== id));
  }, [token]);

  const getFriend = useCallback((id: string) => friends.find((item) => item.id === id), [friends]);

  const value = useMemo(() => ({ friends, loading, error, refresh, addFriend, removeFriend, getFriend }), [friends, loading, error, refresh, addFriend, removeFriend, getFriend]);

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used within FriendsProvider");
  return ctx;
}
