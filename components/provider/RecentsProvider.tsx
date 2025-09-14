import React, { createContext, useContext, useMemo, useState } from "react";

export type RecentNote = { id?: string | null; title?: string | null } | null;
export type RecentPdf = { id?: string | null; title?: string | null } | null;

type Ctx = {
  lastNote: RecentNote;
  setLastNote: (n: RecentNote) => void;
  lastPdf: RecentPdf;
  setLastPdf: (p: RecentPdf) => void;
};

const RecentsContext = createContext<Ctx | null>(null);

export function RecentsProvider({ children }: { children: React.ReactNode }) {
  const [lastNote, setLastNote] = useState<RecentNote>(null);
  const [lastPdf, setLastPdf] = useState<RecentPdf>(null);
  const value = useMemo(() => ({ lastNote, setLastNote, lastPdf, setLastPdf }), [lastNote, lastPdf]);
  return <RecentsContext.Provider value={value}>{children}</RecentsContext.Provider>;
}

export function useRecents() {
  const ctx = useContext(RecentsContext);
  if (!ctx) throw new Error("useRecents must be used within RecentsProvider");
  return ctx;
}

