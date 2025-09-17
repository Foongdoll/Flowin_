import { Alert } from "react-native";

const API_URL_BASE = "https://b820a232ec66.ngrok-free.app"; //(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");

export type HttpOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export async function http(path: string, options: HttpOptions = {}) {
  const method = options.method || "GET";
  const normalized = path.startsWith("/") ? path : "/" + path;
  const url = API_URL_BASE + normalized;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  let body: BodyInit | undefined;
  const payload = options.body;
  if (payload !== undefined && payload !== null) {
    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      body = payload as BodyInit;
    } else {      
      headers["Content-Type"] = "application/json";      
      body = JSON.stringify(payload);      
    }
  }

  if (options.token) {
    headers["Authorization"] = "Bearer " + options.token;
  }

  const response = await fetch(url, { method, headers, body });
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    const message = (data && data.message) || data?.error || response.statusText;
    throw new Error(typeof message === "string" ? message : "요청에 실패했습니다.");
  }

  return data;
}

export { API_URL_BASE };
