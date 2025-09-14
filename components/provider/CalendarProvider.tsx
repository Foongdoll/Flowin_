import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  participants?: string; // comma-separated for now
  place?: string;
  supplies?: string;
  remarks?: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
};

type Ctx = {
  events: CalendarEvent[];
  add: (e: Omit<CalendarEvent, "id">) => string;
  update: (id: string, patch: Partial<CalendarEvent>) => void;
  remove: (id: string) => void;
  get: (id: string) => CalendarEvent | undefined;
};

const CalendarContext = createContext<Ctx | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => []);

  const add: Ctx["add"] = useCallback((e) => {
    const id = `${Date.now()}`;
    setEvents((prev) => [...prev, { ...e, id }]);
    return id;
  }, []);

  const update: Ctx["update"] = useCallback((id, patch) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  }, []);

  const remove: Ctx["remove"] = useCallback((id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }, []);

  const get: Ctx["get"] = useCallback((id) => {
    return events.find((e) => e.id === id);
  }, [events]);

  const value = useMemo(() => ({ events, add, update, remove, get }), [events, add, update, remove, get]);
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}

