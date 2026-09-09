// Talks to the tadm backend. Base URL is empty when the Node server also
// serves this site (same origin); set VITE_API_URL to point elsewhere.
const BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "tadm_token";

let token = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
} catch {
  token = null;
}

export function getToken() {
  return token;
}

export function setToken(value) {
  token = value || null;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("تعذّر الاتصال بالخادم");
  }
  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event("tadm:unauthorized"));
    throw new Error("انتهت الجلسة، سجّل الدخول من جديد");
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw new Error(data?.error || "فشل الطلب");
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  patch: (path, body) => request("PATCH", path, body ?? {}),
  del: (path) => request("DELETE", path),
};
