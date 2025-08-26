import { http } from "../config/api";

export type OrderItemInput = { product_id: number; quantity: number };

export type CreateOrderRequest = {
  items: OrderItemInput[];
};

export type CreateOrderResponse = {
  order_id: number; 
  total: number;
  order_date: string;
};

export type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
};

export type Order = {
  order_id: number;
  order_date: string;
  total: number;
  items: OrderItem[];
};

export async function createOrder(payload: CreateOrderRequest) {
  const token = localStorage.getItem("token");
  return http.post<CreateOrderResponse, CreateOrderRequest>("/orders/checkout", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function listMyOrders() {
  const token = localStorage.getItem("token");
  return http.get<Order[]>("/orders/my", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
