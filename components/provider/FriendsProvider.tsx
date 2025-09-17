import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Friend = {
  id: string;
  name: string;
  tag: string;
  createdAt: string;
};

type Ctx = {
  friends: Friend[];
  loading: boolean;
  addFriend: (name: string) => Promise<Friend>;
  removeFriend: (id: string) => Promise<void>;
  getFriend: (id: string) => Friend | undefined;
};

const STORAGE_KEY = "friends.list";

const FriendsContext = createContext<Ctx | null>(null);

function generateTag(existing: Set<string>) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let tag = "";
  let attempts = 0;
  while (attempts < 1000) {
    const partA = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const partB = Array.from({ length: 3 }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
    tag = partA + partB;
    if (!existing.has(tag)) {
      return tag;
    }
    attempts += 1;
  }
  let fallback = String(Date.now());
  while (existing.has(fallback)) {
    fallback = String(Date.now()) + String(Math.floor(Math.random() * 1000));
  }
  return fallback;
}

async function loadStoredFriends(): Promise<Friend[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.tag === "string");
  } catch {
    return [];
  }
}

async function persistFriends(friends: Friend[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
  } catch {
    // ignore persistence errors
  }
}

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadStoredFriends();
      if (mounted) {
        setFriends(stored);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addFriend: Ctx["addFriend"] = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("이름을 입력하세요.");
    const entry = await new Promise<Friend>((resolve) => {
      setFriends((prev) => {
        const tags = new Set(prev.map((item) => item.tag));
        const tag = generateTag(tags);
        const friend: Friend = {
          id: "friend-" + tag,
          name: trimmed,
          tag,
          createdAt: new Date().toISOString(),
        };
        const next = [friend, ...prev];
        persistFriends(next);
        resolve(friend);
        return next;
      });
    });
    return entry;
  }, []);

  const removeFriend: Ctx["removeFriend"] = useCallback(async (id) => {
    await new Promise<void>((resolve) => {
      setFriends((prev) => {
        const next = prev.filter((item) => item.id !== id);
        persistFriends(next);
        resolve();
        return next;
      });
    });
  }, []);

  const getFriend = useCallback((id: string) => friends.find((item) => item.id === id), [friends]);

  const value = useMemo(() => ({ friends, loading, addFriend, removeFriend, getFriend }), [friends, loading, addFriend, removeFriend, getFriend]);

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used within FriendsProvider");
  return ctx;
}
