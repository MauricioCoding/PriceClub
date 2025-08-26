export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5002";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, init?: RequestInit) =>
    fetch(`${API_BASE}${path}`, init).then(handle<T>),

  post: <T, B>(path: string, body: B, init?: RequestInit) =>
    fetch(`${API_BASE}${path}`, {
      ...init, // spread first so we can overwrite below
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      body: JSON.stringify(body),
    }).then(handle<T>),
};
