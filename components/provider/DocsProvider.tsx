import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_URL_BASE, http } from "../../lib/http";
import { useAuth } from "./AuthProvider";

type UploadPayload = {
  file: { uri: string; name: string; type: string };
  title?: string;
};

export type Doc = {
  id: string;
  title: string;
  originalName: string;
  mime: string;
  size: number;
  path: string;
  uploadedAt: string;
};

type Ctx = {
  docs: Doc[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upload: (payload: UploadPayload) => Promise<Doc>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Doc | undefined;
  fileUrl: (doc: Doc) => string;
};

const DocsContext = createContext<Ctx | null>(null);

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setDocs([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await http("/docs", { token });
      setDocs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "자료를 불러오지 못했습니다.");
      setDocs([]);
    } finally {
      setTimeout(() => setLoading(false), 1000)
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload: Ctx["upload"] = useCallback(async ({ file, title }) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    const form = new FormData();
    form.append("file", { uri: file.uri, name: file.name, type: file.type } as any);
    if (title) form.append("title", title);
    const created = await http("/docs/upload", { method: "POST", body: form, token });
    setDocs((prev) => [created, ...prev]);
    return created;
  }, [token]);

  const remove: Ctx["remove"] = useCallback(async (id) => {
    if (!token) throw new Error("로그인이 필요합니다.");
    await http("/docs/" + id, { method: "DELETE", token });
    setDocs((prev) => prev.filter((item) => item.id !== id));
  }, [token]);

  const get = useCallback((id: string) => docs.find((item) => item.id === id), [docs]);

  const fileUrl = useCallback((doc: Doc) => {
    return API_URL_BASE.replace(/\/$/, "") + "/" + doc.path.replace(/^\//, "");
  }, []);

  const value = useMemo(() => ({
    docs,
    loading,
    error,
    refresh,
    upload,
    remove,
    get,
    fileUrl,
  }), [docs, loading, error, refresh, upload, remove, get, fileUrl]);

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}

export function useDocs() {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used within DocsProvider");
  return ctx;
}
