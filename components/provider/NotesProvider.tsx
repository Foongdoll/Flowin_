import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";
import { useAuth } from "./AuthProvider";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Ctx = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: { title: string; content: string }) => Promise<Note>;
  update: (id: string, patch: Partial<Pick<Note, "title" | "content">>) => Promise<Note>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Note | undefined;
  fetchById: (id: string) => Promise<Note>;
};

const NotesContext = createContext<Ctx | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setNotes([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await http("/notes", { token });
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "노트를 불러오지 못했습니다.");
      setNotes([]);
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create: Ctx["create"] = useCallback(async (data) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const created = await http("/notes", { method: "POST", body: data, token });
    setNotes((prev) => [created, ...prev]);
    return created;
  }, [token]);

  const update: Ctx["update"] = useCallback(async (id, patch) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const updated = await http("/notes/" + id, { method: "PUT", body: patch, token });
    setNotes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, [token]);

  const remove: Ctx["remove"] = useCallback(async (id) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    await http("/notes/" + id, { method: "DELETE", token });
    setNotes((prev) => prev.filter((item) => item.id !== id));
  }, [token]);

  const get = useCallback((id: string) => notes.find((item) => item.id === id), [notes]);

  const fetchById: Ctx["fetchById"] = useCallback(async (id) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const existing = notes.find((item) => item.id === id);
    if (existing) return existing;
    const data = await http("/notes/" + id, { token });
    if (data) {
      setNotes((prev) => {
        const has = prev.some((item) => item.id === data.id);
        return has ? prev.map((item) => (item.id === data.id ? data : item)) : prev.concat(data);
      });
    }
    return data;
  }, [notes, token]);

  const value = useMemo(() => ({
    notes,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    get,
    fetchById,
  }), [notes, loading, error, refresh, create, update, remove, get, fetchById]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
