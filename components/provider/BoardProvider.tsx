import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string; // ISO
  category: string;
};

type Ctx = {
  posts: Post[];
  categories: string[];
  add: (p: Omit<Post, "id" | "createdAt"> & { createdAt?: string }) => string;
  update: (id: string, patch: Partial<Post>) => void;
  remove: (id: string) => void;
  get: (id: string) => Post | undefined;
};

const BoardContext = createContext<Ctx | null>(null);

function seed(): Post[] {
  const now = Date.now();
  const cats = ["공지", "질문", "팁", "모집", "자유", "버그"];
  const mk = (i: number, title: string, category: string): Post => ({
    id: `${now - i}`,
    title,
    content: `${title}\n\n샘플 본문입니다. 실제 백엔드 연동 시 교체됩니다.`,
    author: i % 2 ? "홍길동" : "관리자",
    createdAt: new Date(now - i * 3600_000).toISOString(),
    category,
  });
  return [
    mk(1, "공지: 앱 업데이트 안내", cats[0]),
    mk(2, "질문: PDF 마스킹 단축키 있나요?", cats[1]),
    mk(3, "팁: 노트 미리보기 활용법", cats[2]),
    mk(4, "스터디 모집: 토요일 2시", cats[3]),
    mk(5, "자유: 오늘의 공부 인증", cats[4]),
    mk(6, "버그 제보: 채팅 입력바 겹침", cats[5]),
  ];
}

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => seed());
  const categories = ["전체", "공지", "질문", "팁", "모집", "자유", "버그"] as const;

  const add: Ctx["add"] = useCallback((p) => {
    const id = `${Date.now()}`;
    const createdAt = p.createdAt ?? new Date().toISOString();
    setPosts((prev) => [
      { id, createdAt, title: p.title, content: p.content, author: p.author, category: p.category },
      ...prev,
    ]);
    return id;
  }, []);

  const update: Ctx["update"] = useCallback((id, patch) => {
    setPosts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove: Ctx["remove"] = useCallback((id) => {
    setPosts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const get: Ctx["get"] = useCallback((id) => posts.find((x) => x.id === id), [posts]);

  const value = useMemo(() => ({ posts, categories: categories as unknown as string[], add, update, remove, get }), [posts, add, update, remove, get]);
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
