import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../lib/http";
import { useAuth } from "./AuthProvider";

export type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  authorName?: string | null;
};

type PostFilters = {
  q?: string;
  category?: string;
};

type Ctx = {
  posts: Post[];
  allPosts: Post[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refresh: (filters?: PostFilters) => Promise<void>;
  add: (p: { title: string; content: string; category: string; authorName?: string }) => Promise<Post>;
  update: (id: string, patch: Partial<Post>) => Promise<Post>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Post | undefined;
  fetchById: (id: string) => Promise<Post>;
};

const BoardContext = createContext<Ctx | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef<PostFilters>({});

  const refresh = useCallback(async (nextFilters?: PostFilters) => {
    const filters = nextFilters ?? filtersRef.current;
    if (nextFilters) {
      filtersRef.current = { ...nextFilters };
    }
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (filters.q) qs.append("q", filters.q);
      if (filters.category && filters.category !== "전체") qs.append("category", filters.category);
      const query = qs.toString();
      const path = query ? "/posts?" + query : "/posts";
      const data = await http(path);
      setPosts(data);
      const isUnfiltered = !filters.q && (!filters.category || filters.category === "전체");
      if (isUnfiltered) {
        setAllPosts(data);
      } else {
        http("/posts")
          .then((all) => {
            if (Array.isArray(all)) {
              setAllPosts(all);
            }
          })
          .catch(() => {
            // ignore background refresh failure
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
      setPosts([]);
      const isUnfiltered = !filters.q && (!filters.category || filters.category === "전체");
      if (isUnfiltered) {
        setAllPosts([]);
      }
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await http("/posts/categories");
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch {
        // ignore category load failures
      }
    })();
    refresh();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const add: Ctx["add"] = useCallback(async (p) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const created = await http("/posts", { method: "POST", body: p, token });
    setPosts((prev) => [created, ...prev]);
    setAllPosts((prev) => [created, ...prev]);
    await refresh();
    return created;
  }, [token, refresh]);

  const update: Ctx["update"] = useCallback(async (id, patch) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const updated = await http("/posts/" + id, { method: "PUT", body: patch, token });
    setPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
    setAllPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
    await refresh();
    return updated;
  }, [token, refresh]);

  const remove: Ctx["remove"] = useCallback(async (id) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    await http("/posts/" + id, { method: "DELETE", token });
    setPosts((prev) => prev.filter((x) => x.id !== id));
    setAllPosts((prev) => prev.filter((x) => x.id !== id));
    await refresh();
  }, [token, refresh]);

  const get = useCallback((id: string) => posts.find((x) => x.id === id), [posts]);

  const fetchById: Ctx["fetchById"] = useCallback(async (id) => {
    const existing = posts.find((x) => x.id === id);
    if (existing) return existing;
    const data = await http("/posts/" + id);
    if (data) {
      setPosts((prev) => {
        const has = prev.some((x) => x.id === data.id);
        return has ? prev.map((x) => (x.id === data.id ? data : x)) : prev.concat(data);
      });
      setAllPosts((prev) => {
        const has = prev.some((x) => x.id === data.id);
        return has ? prev.map((x) => (x.id === data.id ? data : x)) : prev.concat(data);
      });
    }
    return data;
  }, [posts]);

  const value = useMemo(() => ({
    posts,
    allPosts,
    categories,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
    get,
    fetchById,
  }), [posts, allPosts, categories, loading, error, refresh, add, update, remove, get, fetchById]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
