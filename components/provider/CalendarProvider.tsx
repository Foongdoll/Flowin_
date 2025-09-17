import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";
import { useAuth } from "./AuthProvider";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  participants?: string;
  place?: string;
  supplies?: string;
  remarks?: string;
  start: string;
  end: string;
};

type Ctx = {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (e: Omit<CalendarEvent, "id">) => Promise<CalendarEvent>;
  update: (id: string, patch: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => CalendarEvent | undefined;
};

const CalendarContext = createContext<Ctx | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await http("/events", { token });
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정을 불러오지 못했습니다.");
      setEvents([]);
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add: Ctx["add"] = useCallback(async (e) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const created = await http("/events", { method: "POST", body: e, token });
    setEvents((prev) => prev.concat(created));
    return created;
  }, [token]);

  const update: Ctx["update"] = useCallback(async (id, patch) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const updated = await http("/events/" + id, { method: "PUT", body: patch, token });
    setEvents((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, [token]);

  const remove: Ctx["remove"] = useCallback(async (id) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    await http("/events/" + id, { method: "DELETE", token });
    setEvents((prev) => prev.filter((item) => item.id !== id));
  }, [token]);

  const get = useCallback((id: string) => events.find((item) => item.id === id), [events]);

  const value = useMemo(() => ({
    events,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
    get,
  }), [events, loading, error, refresh, add, update, remove, get]);

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
