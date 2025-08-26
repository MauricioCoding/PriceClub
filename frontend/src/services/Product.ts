import { http } from "../config/api";
import type { Product } from "../types";

export async function listProducts(): Promise<Product[]> {
  const token = localStorage.getItem("token");
  return http.get<Product[]>("/products", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
