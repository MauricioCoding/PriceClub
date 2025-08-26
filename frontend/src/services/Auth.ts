import { http } from "../config/api";

export type LoginRequest = { email: string; password: string };

export type User = {
  id: number;
  name: string;
  email: string;
  membership_status?: string;
  membership_expiration?: string;
  created_at?: string;
};

export type LoginResponse = {
  token: string;
  user?: User;
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse, LoginRequest>("/auth/login", req);
}

export function saveAuth({ token, user }: LoginResponse) {
  localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
